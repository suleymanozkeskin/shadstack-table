import { useMemo } from 'react';
import { type Row } from '@tanstack/react-table';
import {
  type DropdownOption,
  type SST_Column,
  type SST_ColumnDef,
  type SST_ColumnOrderState,
  type SST_DefinedColumnDef,
  type SST_DefinedTableOptions,
  type SST_FilterOption,
  type SST_Header,
  type SST_RowData,
  type SST_TableInstance,
} from '../types';

export const getColumnId = <TData extends SST_RowData>(columnDef: SST_ColumnDef<TData>): string =>
  columnDef.id ?? columnDef.accessorKey?.toString?.() ?? columnDef.header;

export const getAllLeafColumnDefs = <TData extends SST_RowData>(
  columns: SST_ColumnDef<TData>[],
): SST_ColumnDef<TData>[] => {
  const allLeafColumnDefs: SST_ColumnDef<TData>[] = [];
  const getLeafColumns = (cols: SST_ColumnDef<TData>[]) => {
    cols.forEach((col) => {
      if (col.columns) {
        getLeafColumns(col.columns);
      } else {
        allLeafColumnDefs.push(col);
      }
    });
  };
  getLeafColumns(columns);
  return allLeafColumnDefs;
};

/**
 * Per-column cache entry used by `prepareColumns` to preserve enriched
 * column-def identity across renders. TanStack `useReactTable` partly
 * memoizes on column-def reference equality, so if we returned a fresh
 * object every render the table would needlessly re-derive internal state.
 *
 * The cache is keyed by the original (consumer-owned) column-def
 * reference, and additionally records the inputs that affect enrichment.
 * When any of those inputs change between renders, the cached entry is
 * discarded and a fresh enriched def is built.
 */
type PreparedColumnCacheEntry<TData extends SST_RowData> = {
  enriched: SST_DefinedColumnDef<TData>;
  // inputs that, when changed, invalidate the cached enriched def
  aggregationFns: Record<string, unknown>;
  filterFns: Record<string, unknown>;
  sortingFns: Record<string, unknown>;
  filterFnId: string | undefined;
  defaultDisplayColumn: unknown;
  // the original columns array reference (for group columns) — if a
  // group's children array reference changes we rebuild children too
  childrenRef: unknown;
};

export type PrepareColumnsCache<TData extends SST_RowData> = WeakMap<
  SST_ColumnDef<TData>,
  PreparedColumnCacheEntry<TData>
>;

export const createPrepareColumnsCache = <
  TData extends SST_RowData,
>(): PrepareColumnsCache<TData> => new WeakMap();

export const prepareColumns = <TData extends SST_RowData>({
  cache,
  columnDefs,
  tableOptions,
}: {
  cache?: PrepareColumnsCache<TData>;
  columnDefs: SST_ColumnDef<TData>[];
  tableOptions: SST_DefinedTableOptions<TData>;
}): SST_DefinedColumnDef<TData>[] => {
  const {
    aggregationFns = {},
    defaultDisplayColumn,
    filterFns = {},
    sortingFns = {},
    state: { columnFilterFns = {} } = {},
  } = tableOptions;
  return columnDefs.map((columnDef) => {
    const id = columnDef.id ?? getColumnId(columnDef);
    const filterFnId = columnFilterFns[id];
    const childrenRef = columnDef.columns;

    //fast path: return cached enriched def if no relevant inputs changed
    const cached = cache?.get(columnDef);
    if (
      cached &&
      cached.aggregationFns === aggregationFns &&
      cached.filterFns === filterFns &&
      cached.sortingFns === sortingFns &&
      cached.filterFnId === filterFnId &&
      cached.defaultDisplayColumn === defaultDisplayColumn &&
      cached.childrenRef === childrenRef
    ) {
      return cached.enriched;
    }

    //start from a shallow copy — never mutate the consumer-owned def
    let enriched: SST_ColumnDef<TData> = { ...columnDef, id };

    //assign columnDefType
    if (!enriched.columnDefType) enriched.columnDefType = 'data';
    if (enriched.columns?.length) {
      enriched.columnDefType = 'group';
      //recursively prepare columns if this is a group column
      enriched.columns = prepareColumns({
        cache,
        columnDefs: enriched.columns,
        tableOptions,
      });
    } else if (enriched.columnDefType === 'data') {
      //assign aggregationFns if multiple aggregationFns are provided
      if (Array.isArray(enriched.aggregationFn)) {
        const aggFns = enriched.aggregationFn as string[];
        enriched.aggregationFn = (
          columnId: string,
          leafRows: Row<TData>[],
          childRows: Row<TData>[],
        ) => aggFns.map((fn) => aggregationFns[fn]?.(columnId, leafRows, childRows));
      }

      //assign filterFns
      if (filterFnId !== undefined && Object.keys(filterFns).includes(filterFnId)) {
        enriched.filterFn = filterFns[filterFnId] ?? filterFns.fuzzy;
        // oxlint-disable-next-line no-underscore-dangle
        (enriched as SST_DefinedColumnDef<TData>)._filterFn = filterFnId;
      }

      //assign sortingFns
      if (Object.keys(sortingFns).includes(enriched.sortingFn as string)) {
        // @ts-expect-error
        enriched.sortingFn = sortingFns[enriched.sortingFn];
      }
    } else if (enriched.columnDefType === 'display') {
      enriched = {
        ...(defaultDisplayColumn as SST_ColumnDef<TData>),
        ...enriched,
      };
    }

    const result = enriched as SST_DefinedColumnDef<TData>;
    cache?.set(columnDef, {
      aggregationFns,
      childrenRef,
      defaultDisplayColumn,
      enriched: result,
      filterFnId,
      filterFns,
      sortingFns,
    });
    return result;
  });
};

export const reorderColumn = <TData extends SST_RowData>(
  draggedColumn: SST_Column<TData>,
  targetColumn: SST_Column<TData>,
  columnOrder: SST_ColumnOrderState,
): SST_ColumnOrderState => {
  if (draggedColumn.getCanPin()) {
    draggedColumn.pin(targetColumn.getIsPinned());
  }
  const newColumnOrder = [...columnOrder];
  newColumnOrder.splice(
    newColumnOrder.indexOf(targetColumn.id),
    0,
    newColumnOrder.splice(newColumnOrder.indexOf(draggedColumn.id), 1)[0],
  );
  return newColumnOrder;
};

export const getDefaultColumnFilterFn = <TData extends SST_RowData>(
  columnDef: SST_ColumnDef<TData>,
): SST_FilterOption => {
  const { filterVariant } = columnDef;
  if (filterVariant === 'multi-select') return 'arrIncludesSome';
  if (filterVariant?.includes('range')) return 'betweenInclusive';
  if (filterVariant === 'select' || filterVariant === 'checkbox') return 'equals';
  return 'fuzzy';
};

export const getColumnFilterInfo = <TData extends SST_RowData>({
  header,
  table,
}: {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}) => {
  const {
    options: { columnFilterModeOptions },
  } = table;
  const { column } = header;
  const { columnDef } = column;
  const { filterVariant } = columnDef;

  const isDateFilter = !!(filterVariant?.startsWith('date') || filterVariant?.startsWith('time'));
  const isAutocompleteFilter = filterVariant === 'autocomplete';
  const isRangeFilter =
    filterVariant?.includes('range') ||
    // oxlint-disable-next-line no-underscore-dangle
    ['between', 'betweenInclusive', 'inNumberRange'].includes(columnDef._filterFn);
  const isSelectFilter = filterVariant === 'select';
  const isMultiSelectFilter = filterVariant === 'multi-select';
  const isTextboxFilter =
    ['autocomplete', 'text'].includes(filterVariant!) || (!isSelectFilter && !isMultiSelectFilter);
  // oxlint-disable-next-line no-underscore-dangle
  const currentFilterOption = columnDef._filterFn;

  const allowedColumnFilterOptions = columnDef?.columnFilterModeOptions ?? columnFilterModeOptions;

  const facetedUniqueValues = column.getFacetedUniqueValues();

  return {
    allowedColumnFilterOptions,
    currentFilterOption,
    facetedUniqueValues,
    isAutocompleteFilter,
    isDateFilter,
    isMultiSelectFilter,
    isRangeFilter,
    isSelectFilter,
    isTextboxFilter,
  } as const;
};

export const useDropdownOptions = <TData extends SST_RowData>({
  header,
  table,
}: {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}): DropdownOption[] | undefined => {
  const { column } = header;
  const { columnDef } = column;
  const { facetedUniqueValues, isAutocompleteFilter, isMultiSelectFilter, isSelectFilter } =
    getColumnFilterInfo({ header, table });

  return useMemo<DropdownOption[] | undefined>(
    () =>
      columnDef.filterSelectOptions ??
      ((isSelectFilter || isMultiSelectFilter || isAutocompleteFilter) && facetedUniqueValues
        ? Array.from(facetedUniqueValues.keys())
            .filter((value) => value !== null && value !== undefined)
            .sort((a, b) => a.localeCompare(b))
        : undefined),
    [
      columnDef.filterSelectOptions,
      facetedUniqueValues,
      isAutocompleteFilter,
      isMultiSelectFilter,
      isSelectFilter,
    ],
  );
};
