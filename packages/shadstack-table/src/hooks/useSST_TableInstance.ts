import { createEditingApi } from '../utils/editing';
import { type ReadonlyStore } from '@tanstack/react-store';
import { createTableStateSetters } from '../utils/state-setters';
import { useMemo, useRef } from 'react';
import {
  useTable,
  getInitialTableState,
  type TableOptions,
  type TableState,
} from '@tanstack/react-table';
import { SST_STATE_DEFAULTS, type SST_Features } from '../features';
import {
  type SST_ColumnDef,
  type SST_DefinedTableOptions,
  type SST_FilterControl,
  type SST_RowData,
  type SST_StatefulTableOptions,
  type SST_StateAtoms,
  type SST_StateBaseAtoms,
  type SST_TableInstance,
  type SST_TableState,
} from '../types';
import {
  createPrepareColumnsCache,
  getAllLeafColumnDefs,
  getColumnId,
  getDefaultColumnFilterFn,
  type PrepareColumnsCache,
  prepareColumns,
} from '../utils/column.utils';
import {
  getDefaultColumnOrderIds,
  showRowActionsColumn,
  showRowDragColumn,
  showRowExpandColumn,
  showRowNumbersColumn,
  showRowPinningColumn,
  showRowSelectionColumn,
  showRowSpacerColumn,
} from '../utils/displayColumn.utils';
import { getSST_RowActionsColumnDef } from './display-columns/getSST_RowActionsColumnDef';
import { getSST_RowDragColumnDef } from './display-columns/getSST_RowDragColumnDef';
import { getSST_RowExpandColumnDef } from './display-columns/getSST_RowExpandColumnDef';
import { getSST_RowNumbersColumnDef } from './display-columns/getSST_RowNumbersColumnDef';
import { getSST_RowPinningColumnDef } from './display-columns/getSST_RowPinningColumnDef';
import { getSST_RowSelectColumnDef } from './display-columns/getSST_RowSelectColumnDef';
import { getSST_RowSpacerColumnDef } from './display-columns/getSST_RowSpacerColumnDef';
import { useSST_Effects } from './useSST_Effects';

const selectHostState = <TData extends SST_RowData>(rawState: TableState<SST_Features>) => {
  // SAFETY: The registered core feature seeds every shadstack state slice.
  const s = rawState as SST_TableState<TData>;
  const showSkeletonData = !!(s.isLoading || s.showSkeletons);

  return {
    columnFilterFns: s.columnFilterFns,
    creatingRow: s.creatingRow,
    globalFilterFn: s.globalFilterFn,
    grouping: s.grouping,
    isDraggingColumn: !!s.draggingColumn,
    isDraggingRow: !!s.draggingRow,
    isResizingColumn: !!s.columnResizing.isResizingColumn,
    showSkeletonData,
    skeletonPageSize: showSkeletonData ? s.pagination.pageSize : 0,
  };
};

/**
 * The MRT hook that wraps the TanStack useTable hook and adds additional functionality
 *
 * Every state slice — TanStack's and shadstack's — is owned by the table's
 * atoms (`shadstackCoreFeature` registers the shadstack slices as real table
 * state). This hook holds no React state of its own: setters write atoms,
 * atom changes notify the root store subscription, and the host re-renders.
 * With no `useTable` selector the render semantics match the previous
 * useState-based implementation exactly; narrowing happens in a later stage.
 *
 * @param definedTableOptions - table options with proper defaults set
 * @returns the MRT table instance
 */
export const useSST_TableInstance = <TData extends SST_RowData>(
  definedTableOptions: SST_DefinedTableOptions<TData>,
): SST_TableInstance<TData> => {
  const lastSelectedRowId = useRef<null | string>(null);
  const actionCellRef = useRef<HTMLTableCellElement>(null);
  const bottomToolbarRef = useRef<HTMLDivElement>(null);
  const editInputRefs = useRef<Record<string, HTMLInputElement | HTMLButtonElement>>({});
  const filterInputRefs = useRef<Record<string, SST_FilterControl>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeadCellRefs = useRef<Record<string, HTMLTableCellElement>>({});
  const tablePaperRef = useRef<HTMLDivElement>(null);
  const topToolbarRef = useRef<HTMLDivElement>(null);
  const tableHeadRef = useRef<HTMLTableSectionElement>(null);
  const tableFooterRef = useRef<HTMLTableSectionElement>(null);

  //transform initial state with proper column order — derived immutably
  //from the consumer-provided options. We only need to derive this once
  //per mount (it's the *initial* state); the empty dep array is the
  //correct shape here. Every key placed here becomes a table atom, so the
  //defaults that used to live in useState initializers ride in through
  //this object instead.
  const initialState: Partial<SST_TableState<TData>> = useMemo(() => {
    const initState: Partial<SST_TableState<TData>> = {
      ...(definedTableOptions.initialState ?? {}),
    };

    initState.columnOrder =
      initState.columnOrder ??
      getDefaultColumnOrderIds({
        ...definedTableOptions,
        state: {
          ...definedTableOptions.initialState,
          ...definedTableOptions.state,
        },
      });
    initState.globalFilterFn = definedTableOptions.globalFilterFn ?? 'fuzzy';
    //seed the per-column filter-fn map from the column defs (previously the
    //useState initializer's job)
    initState.columnFilterFns = Object.assign(
      {},
      ...getAllLeafColumnDefs(definedTableOptions.columns).map((col) => ({
        [getColumnId(col)]:
          col.filterFn instanceof Function
            ? (col.filterFn.name ?? 'custom')
            : (col.filterFn ??
              initState.columnFilterFns?.[getColumnId(col)] ??
              getDefaultColumnFilterFn(col)),
      })),
    );

    return initState;
    // initialState is intentionally captured once at mount — re-deriving
    // it on every render would defeat the "initial state" contract.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //The previous render's table instance. Render-body computations below need
  //current state BEFORE useTable runs; `getState()` reads the live store, so
  //a render triggered by a state write sees the value that caused it — the
  //same freshness the deleted useState calls provided. On the first render
  //no table exists yet, so fall back to the seeded initial state.
  const tableRef = useRef<SST_TableInstance<TData> | null>(null);
  const editingApi = useMemo(() => createEditingApi<TData>(), []);
  const stateSetters = useMemo(() => createTableStateSetters(() => tableRef.current!), []);

  const currentState: SST_TableState<TData> = tableRef.current
    ? tableRef.current.getState()
    : {
        ...getInitialTableState(definedTableOptions.features),
        ...SST_STATE_DEFAULTS,
        ...initialState,
        ...definedTableOptions.state,
      };

  //The stateful view of the options: `state` is the full current snapshot.
  //This object feeds the display-column factories, `prepareColumns`, and the
  //skeleton-data derivation — it is NOT what `useTable` receives as `state`
  //(see below). Derived fresh so downstream code never sees the consumer's
  //options mutated.
  let statefulTableOptions: SST_StatefulTableOptions<TData> = {
    ...definedTableOptions,
    initialState,
    state: currentState,
  };

  //don't recompute columnDefs while resizing column or dragging column/row
  const columnDefsRef = useRef<SST_ColumnDef<TData>[]>([]);
  //WeakMap cache that preserves enriched column-def identity across
  //renders so TanStack's column-def-keyed memoization stays warm.
  const prepareColumnsCacheRef = useRef<PrepareColumnsCache<TData>>(createPrepareColumnsCache());

  const preparedColumns =
    statefulTableOptions.state.columnResizing.isResizingColumn ||
    statefulTableOptions.state.draggingColumn ||
    statefulTableOptions.state.draggingRow
      ? columnDefsRef.current
      : prepareColumns({
          cache: prepareColumnsCacheRef.current,
          columnDefs: [
            ...[
              showRowPinningColumn(statefulTableOptions) &&
                getSST_RowPinningColumnDef(statefulTableOptions),
              showRowDragColumn(statefulTableOptions) &&
                getSST_RowDragColumnDef(statefulTableOptions),
              showRowActionsColumn(statefulTableOptions) &&
                getSST_RowActionsColumnDef(statefulTableOptions),
              showRowExpandColumn(statefulTableOptions) &&
                getSST_RowExpandColumnDef(statefulTableOptions),
              showRowSelectionColumn(statefulTableOptions) &&
                getSST_RowSelectColumnDef(statefulTableOptions),
              showRowNumbersColumn(statefulTableOptions) &&
                getSST_RowNumbersColumnDef(statefulTableOptions),
            ].filter((column) => column !== false),
            ...statefulTableOptions.columns,
            ...[
              showRowSpacerColumn(statefulTableOptions) &&
                getSST_RowSpacerColumnDef(statefulTableOptions),
            ].filter((column) => column !== false),
          ],
          tableOptions: statefulTableOptions,
        });

  columnDefsRef.current = preparedColumns;

  //if loading, generate blank rows to show skeleton loaders
  const preparedData = useMemo(
    () =>
      (statefulTableOptions.state.isLoading || statefulTableOptions.state.showSkeletons) &&
      !statefulTableOptions.data.length
        ? [...Array(Math.min(statefulTableOptions.state.pagination.pageSize, 20)).fill(null)].map(
            () =>
              Object.assign(
                {},
                ...getAllLeafColumnDefs(preparedColumns).map((col) => ({
                  [getColumnId(col)]: null,
                })),
              ),
          )
        : statefulTableOptions.data,
    [
      preparedColumns,
      statefulTableOptions.data,
      statefulTableOptions.state.isLoading,
      statefulTableOptions.state.pagination.pageSize,
      statefulTableOptions.state.showSkeletons,
    ],
  );

  statefulTableOptions = {
    ...statefulTableOptions,
    columns: preparedColumns,
    data: preparedData,
  };

  //`state` passed to useTable carries ONLY consumer-supplied controlled
  //state. The table's atoms own everything else; passing the full snapshot
  //here would mark every slice controlled, and controlled slices only
  //re-publish to subscribers after a host commit — the table would freeze.
  //
  //The selector is the ceiling on the whole tree: every slice it selects
  //re-renders the host and therefore everything below it. It covers exactly
  //what this hook's render body consumes — the frozen-columnDefs guard
  //(three booleans), the display-column predicates and factories
  //(grouping, creatingRow), column enrichment (columnFilterFns), skeleton
  //data (loading flags + pageSize while loading), and the resolved global
  //filter fn. The selected values themselves are not read — the body reads
  //the live snapshot — so the selector's only job is deciding WHEN the host
  //re-renders. Hover, selection, editing, sorting, pagination, per-mousemove
  //resize deltas: none of them re-render the host; components consume them
  //through their own narrowed subscriptions.
  // SAFETY: Prepared columns resolve shadstack definitions to the registered TanStack features.
  const selectedTable = useTable<SST_Features, TData, ReturnType<typeof selectHostState<TData>>>(
    {
      ...statefulTableOptions,
      state: definedTableOptions.state,
      globalFilterFn: statefulTableOptions.filterFns?.[currentState.globalFilterFn ?? 'fuzzy'],
    } as TableOptions<SST_Features, TData>,
    selectHostState<TData>,
  );

  const { store: sourceStore } = selectedTable;
  // SAFETY: The registered core feature seeds every public state slice in this store.
  const fullStore = sourceStore as ReadonlyStore<SST_TableState<TData>>;

  // SAFETY: Prepared columns, typed state adapters, refs, and setters form the public facade.
  const wrapper = {
    ...selectedTable,
    ...stateSetters,
    ...editingApi,
    get state() {
      return fullStore.get();
    },
    store: fullStore,
    // SAFETY: Every default state key has a derived atom created by TanStack.
    atoms: selectedTable.atoms as SST_StateAtoms<TData>,
    // SAFETY: Every default state key has a writable atom created by TanStack.
    baseAtoms: selectedTable.baseAtoms as SST_StateBaseAtoms<TData>,
    getState: fullStore.get,
    refs: {
      actionCellRef,
      bottomToolbarRef,
      editInputRefs,
      filterInputRefs,
      lastSelectedRowId,
      searchInputRef,
      tableContainerRef,
      tableFooterRef,
      tableHeadCellRefs,
      tableHeadRef,
      tablePaperRef,
      topToolbarRef,
    },
  } as SST_TableInstance<TData>;

  //The public instance is referentially STABLE: created once, refreshed with
  //the latest useTable result every render. useTable itself returns a new
  //object per render (its options change identity), but a component woken by
  //a state subscription while its parents skipped rendering must be able to
  //read live `options`/`state` off whatever `table` reference it holds — a
  //per-render wrapper would hand it stale values. Copying onto one stable
  //object gives every holder the newest contents. Side effect, recorded in
  //the changelog: consumer effects keyed on `[table]` now fire once instead
  //of every render.
  if (tableRef.current === null) {
    tableRef.current = wrapper;
  }

  const table = tableRef.current!;
  Object.defineProperties(table, Object.getOwnPropertyDescriptors(wrapper));

  //getState() remains shadstack's single read surface; it reads the live
  //store snapshot, which applies the derived atoms' controlled-state
  //precedence, so all slices — consumer-controlled ones included — appear in
  //it. The raw facade read rebuilds the snapshot object per call (one getter
  //per slice), and getState() is called several times per cell, so the
  //result is cached and the cache is invalidated on the two occasions the
  //snapshot can change: any store write (covers reads after writes inside
  //one event handler) and the start of a render pass (covers new controlled
  //state arriving through options before its post-commit publication).
  const { store } = table;

  const snapshotCacheRef = useRef<SST_TableState<TData> | null>(null);
  snapshotCacheRef.current = null;
  //The invalidator is registered during render, keyed on STORE identity —
  //not on "first construction". Under StrictMode's double-invoked mount
  //render a first-construction gate would subscribe to the discarded
  //useTable instance's store and leave the kept one without an invalidator;
  //keying on the store means whichever instance survives has its
  //subscription (the discarded one is garbage-collected with its store). An
  //effect would be purer but opens a mount-only window where a child effect
  //writes before the parent's effect has registered the invalidator. The
  //store dies with the component, so no cleanup.
  const cacheInvalidatorStoreRef = useRef<SST_TableInstance<TData>['store'] | null>(null);

  if (cacheInvalidatorStoreRef.current !== store) {
    cacheInvalidatorStoreRef.current = store;
    store.subscribe(() => {
      snapshotCacheRef.current = null;
    });
  }

  table.getState = () => (snapshotCacheRef.current ??= store.get());

  // Setters read this stable facade so callbacks always use current options.

  useSST_Effects(table);

  return table;
};
