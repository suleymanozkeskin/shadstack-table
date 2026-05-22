import { useMemo, useRef, useState } from 'react';
import { useReactTable } from '@tanstack/react-table';
import {
  type SST_Cell,
  type SST_Column,
  type SST_ColumnDef,
  type SST_ColumnFilterFnsState,
  type SST_ColumnOrderState,
  type SST_ColumnSizingInfoState,
  type SST_DefinedTableOptions,
  type SST_DensityState,
  type SST_FilterOption,
  type SST_GroupingState,
  type SST_PaginationState,
  type SST_Row,
  type SST_RowData,
  type SST_StatefulTableOptions,
  type SST_TableInstance,
  type SST_TableState,
  type SST_Updater,
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
import { createRow } from '../utils/tanstack.helpers';
import { getSST_RowActionsColumnDef } from './display-columns/getSST_RowActionsColumnDef';
import { getSST_RowDragColumnDef } from './display-columns/getSST_RowDragColumnDef';
import { getSST_RowExpandColumnDef } from './display-columns/getSST_RowExpandColumnDef';
import { getSST_RowNumbersColumnDef } from './display-columns/getSST_RowNumbersColumnDef';
import { getSST_RowPinningColumnDef } from './display-columns/getSST_RowPinningColumnDef';
import { getSST_RowSelectColumnDef } from './display-columns/getSST_RowSelectColumnDef';
import { getSST_RowSpacerColumnDef } from './display-columns/getSST_RowSpacerColumnDef';
import { useSST_Effects } from './useSST_Effects';

/**
 * The MRT hook that wraps the TanStack useReactTable hook and adds additional functionality
 * @param definedTableOptions - table options with proper defaults set
 * @returns the MRT table instance
 */
export const useSST_TableInstance = <TData extends SST_RowData>(
  definedTableOptions: SST_DefinedTableOptions<TData>,
): SST_TableInstance<TData> => {
  const lastSelectedRowId = useRef<null | string>(null);
  const actionCellRef = useRef<HTMLTableCellElement>(null);
  const bottomToolbarRef = useRef<HTMLDivElement>(null);
  const editInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const filterInputRefs = useRef<Record<string, HTMLInputElement>>({});
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
  //correct shape here.
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
      } as SST_StatefulTableOptions<TData>);
    initState.globalFilterFn = definedTableOptions.globalFilterFn ?? 'fuzzy';
    return initState;
    // initialState is intentionally captured once at mount — re-deriving
    // it on every render would defeat the "initial state" contract.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [actionCell, setActionCell] = useState<SST_Cell<TData> | null>(
    initialState.actionCell ?? null,
  );
  const [creatingRow, _setCreatingRow] = useState<SST_Row<TData> | null>(
    initialState.creatingRow ?? null,
  );
  const [columnFilterFns, setColumnFilterFns] = useState<SST_ColumnFilterFnsState>(() =>
    Object.assign(
      {},
      ...getAllLeafColumnDefs(definedTableOptions.columns as SST_ColumnDef<TData>[]).map((col) => ({
        [getColumnId(col)]:
          col.filterFn instanceof Function
            ? (col.filterFn.name ?? 'custom')
            : (col.filterFn ??
              initialState?.columnFilterFns?.[getColumnId(col)] ??
              getDefaultColumnFilterFn(col)),
      })),
    ),
  );
  const [columnOrder, onColumnOrderChange] = useState<SST_ColumnOrderState>(
    initialState.columnOrder ?? [],
  );
  const [columnSizingInfo, onColumnSizingInfoChange] = useState<SST_ColumnSizingInfoState>(
    initialState.columnSizingInfo ?? ({} as SST_ColumnSizingInfoState),
  );
  const [density, setDensity] = useState<SST_DensityState>(initialState?.density ?? 'comfortable');
  const [draggingColumn, setDraggingColumn] = useState<SST_Column<TData> | null>(
    initialState.draggingColumn ?? null,
  );
  const [draggingRow, setDraggingRow] = useState<SST_Row<TData> | null>(
    initialState.draggingRow ?? null,
  );
  const [editingCell, setEditingCell] = useState<SST_Cell<TData> | null>(
    initialState.editingCell ?? null,
  );
  const [editingRow, setEditingRow] = useState<SST_Row<TData> | null>(
    initialState.editingRow ?? null,
  );
  const [globalFilterFn, setGlobalFilterFn] = useState<SST_FilterOption>(
    initialState.globalFilterFn ?? 'fuzzy',
  );
  const [grouping, onGroupingChange] = useState<SST_GroupingState>(initialState.grouping ?? []);
  const [hoveredColumn, setHoveredColumn] = useState<Partial<SST_Column<TData>> | null>(
    initialState.hoveredColumn ?? null,
  );
  const [hoveredRow, setHoveredRow] = useState<Partial<SST_Row<TData>> | null>(
    initialState.hoveredRow ?? null,
  );
  const [isFullScreen, setIsFullScreen] = useState<boolean>(initialState?.isFullScreen ?? false);
  const [pagination, onPaginationChange] = useState<SST_PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  );
  const [showAlertBanner, setShowAlertBanner] = useState<boolean>(
    initialState?.showAlertBanner ?? false,
  );
  const [showColumnFilters, setShowColumnFilters] = useState<boolean>(
    initialState?.showColumnFilters ?? false,
  );
  const [showGlobalFilter, setShowGlobalFilter] = useState<boolean>(
    initialState?.showGlobalFilter ?? false,
  );
  const [showToolbarDropZone, setShowToolbarDropZone] = useState<boolean>(
    initialState?.showToolbarDropZone ?? false,
  );

  //Derive a fresh stateful options bag (spread + override) rather than
  //mutating the consumer-owned `definedTableOptions` in place. State
  //provided directly on `definedTableOptions` still wins via the spread
  //order — same precedence as before.
  const mergedState = {
    actionCell,
    columnFilterFns,
    columnOrder,
    columnSizingInfo,
    creatingRow,
    density,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    globalFilterFn,
    grouping,
    hoveredColumn,
    hoveredRow,
    isFullScreen,
    pagination,
    showAlertBanner,
    showColumnFilters,
    showGlobalFilter,
    showToolbarDropZone,
    ...definedTableOptions.state,
  };

  //The table options now include all state needed to help determine
  //column visibility and order logic. We treat this as a new object so
  //downstream code never sees the consumer's options mutated.
  let statefulTableOptions: SST_StatefulTableOptions<TData> = {
    ...definedTableOptions,
    initialState,
    state: mergedState,
  } as SST_StatefulTableOptions<TData>;

  //don't recompute columnDefs while resizing column or dragging column/row
  const columnDefsRef = useRef<SST_ColumnDef<TData>[]>([]);
  //WeakMap cache that preserves enriched column-def identity across
  //renders so TanStack's column-def-keyed memoization stays warm.
  const prepareColumnsCacheRef = useRef<PrepareColumnsCache<TData>>(createPrepareColumnsCache());
  const preparedColumns =
    statefulTableOptions.state.columnSizingInfo.isResizingColumn ||
    statefulTableOptions.state.draggingColumn ||
    statefulTableOptions.state.draggingRow
      ? columnDefsRef.current
      : prepareColumns({
          cache: prepareColumnsCacheRef.current,
          columnDefs: [
            ...([
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
            ].filter(Boolean) as SST_ColumnDef<TData>[]),
            ...statefulTableOptions.columns,
            ...([
              showRowSpacerColumn(statefulTableOptions) &&
                getSST_RowSpacerColumnDef(statefulTableOptions),
            ].filter(Boolean) as SST_ColumnDef<TData>[]),
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

  //@ts-expect-error
  const table = useReactTable({
    onColumnOrderChange,
    onColumnSizingInfoChange,
    onGroupingChange,
    onPaginationChange,
    ...statefulTableOptions,
    globalFilterFn: statefulTableOptions.filterFns?.[globalFilterFn ?? 'fuzzy'],
  }) as SST_TableInstance<TData>;

  table.refs = {
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
  };

  table.setActionCell = statefulTableOptions.onActionCellChange ?? setActionCell;
  table.setCreatingRow = (row: SST_Updater<SST_Row<TData> | null | true>) => {
    // oxlint-disable-next-line no-underscore-dangle
    let _row = row;
    if (row === true) {
      _row = createRow(table);
    }
    // oxlint-disable-next-line no-unused-expressions -- nullish-fallback handler chain (upstream pattern)
    statefulTableOptions?.onCreatingRowChange?.(_row as SST_Row<TData> | null) ??
      _setCreatingRow(_row as SST_Row<TData> | null);
  };
  table.setColumnFilterFns = statefulTableOptions.onColumnFilterFnsChange ?? setColumnFilterFns;
  table.setDensity = statefulTableOptions.onDensityChange ?? setDensity;
  table.setDraggingColumn = statefulTableOptions.onDraggingColumnChange ?? setDraggingColumn;
  table.setDraggingRow = statefulTableOptions.onDraggingRowChange ?? setDraggingRow;
  table.setEditingCell = statefulTableOptions.onEditingCellChange ?? setEditingCell;
  table.setEditingRow = statefulTableOptions.onEditingRowChange ?? setEditingRow;
  table.setGlobalFilterFn = statefulTableOptions.onGlobalFilterFnChange ?? setGlobalFilterFn;
  table.setHoveredColumn = statefulTableOptions.onHoveredColumnChange ?? setHoveredColumn;
  table.setHoveredRow = statefulTableOptions.onHoveredRowChange ?? setHoveredRow;
  table.setIsFullScreen = statefulTableOptions.onIsFullScreenChange ?? setIsFullScreen;
  table.setShowAlertBanner = statefulTableOptions.onShowAlertBannerChange ?? setShowAlertBanner;
  table.setShowColumnFilters =
    statefulTableOptions.onShowColumnFiltersChange ?? setShowColumnFilters;
  table.setShowGlobalFilter = statefulTableOptions.onShowGlobalFilterChange ?? setShowGlobalFilter;
  table.setShowToolbarDropZone =
    statefulTableOptions.onShowToolbarDropZoneChange ?? setShowToolbarDropZone;

  useSST_Effects(table);

  return table;
};
