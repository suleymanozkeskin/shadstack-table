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

export const prepareColumns = <TData extends SST_RowData>({
  columnDefs,
  tableOptions,
}: {
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
    //assign columnId
    if (!columnDef.id) columnDef.id = getColumnId(columnDef);
    //assign columnDefType
    if (!columnDef.columnDefType) columnDef.columnDefType = 'data';
    if (columnDef.columns?.length) {
      columnDef.columnDefType = 'group';
      //recursively prepare columns if this is a group column
      columnDef.columns = prepareColumns({
        columnDefs: columnDef.columns,
        tableOptions,
      });
    } else if (columnDef.columnDefType === 'data') {
      //assign aggregationFns if multiple aggregationFns are provided
      if (Array.isArray(columnDef.aggregationFn)) {
        const aggFns = columnDef.aggregationFn as string[];
        columnDef.aggregationFn = (
          columnId: string,
          leafRows: Row<TData>[],
          childRows: Row<TData>[],
        ) => aggFns.map((fn) => aggregationFns[fn]?.(columnId, leafRows, childRows));
      }

      //assign filterFns
      if (Object.keys(filterFns).includes(columnFilterFns[columnDef.id])) {
        columnDef.filterFn = filterFns[columnFilterFns[columnDef.id]] ?? filterFns.fuzzy;
        // oxlint-disable-next-line no-underscore-dangle
        (columnDef as SST_DefinedColumnDef<TData>)._filterFn = columnFilterFns[columnDef.id];
      }

      //assign sortingFns
      if (Object.keys(sortingFns).includes(columnDef.sortingFn as string)) {
        // @ts-expect-error
        columnDef.sortingFn = sortingFns[columnDef.sortingFn];
      }
    } else if (columnDef.columnDefType === 'display') {
      columnDef = {
        ...(defaultDisplayColumn as SST_ColumnDef<TData>),
        ...columnDef,
      };
    }
    return columnDef;
  }) as SST_DefinedColumnDef<TData>[];
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
