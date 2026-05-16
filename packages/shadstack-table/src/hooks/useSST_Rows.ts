// oxlint-disable react-hooks/exhaustive-deps -- intentional narrow dep array; revisit when refactoring
import { useMemo } from 'react';
import { type SST_Row, type SST_RowData, type SST_TableInstance } from '../types';
import { getSST_Rows } from '../utils/row.utils';

export const useSST_Rows = <TData extends SST_RowData>(
  table: SST_TableInstance<TData>,
): SST_Row<TData>[] => {
  const {
    getRowModel,
    getState,
    options: { data, enableGlobalFilterRankedResults, positionCreatingRow },
  } = table;
  const { creatingRow, expanded, globalFilter, pagination, rowPinning, sorting } = getState();

  const rows = useMemo(
    () => getSST_Rows(table),
    [
      creatingRow,
      data,
      enableGlobalFilterRankedResults,
      expanded,
      getRowModel().rows,
      globalFilter,
      pagination.pageIndex,
      pagination.pageSize,
      positionCreatingRow,
      rowPinning,
      sorting,
    ],
  );

  return rows;
};
