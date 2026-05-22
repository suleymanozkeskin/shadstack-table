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
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional invalidation-key list: the memo body reads through `table.*` accessors and these state slices are the keys we need to recompute on. The rule flags them as "unnecessary" because it cannot follow the access through the table instance. FOLLOW-UP: refactor getSST_Rows to take explicit slices, or extract `const rowModelRows = getRowModel().rows` first to silence the complex-expression rule.
    [
      creatingRow,
      data,
      enableGlobalFilterRankedResults,
      expanded,
      // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional accessor call; getRowModel().rows is the canonical TanStack way to track row-model identity. FOLLOW-UP: extract to const rowModelRows above.
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
