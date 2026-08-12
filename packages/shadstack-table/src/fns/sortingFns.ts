import { type RankingInfo, compareItems } from '@tanstack/match-sorter-utils';
import { type Row, sortFns } from '@tanstack/react-table';
import { type SST_Row, type SST_RowData } from '../types';

const fuzzy = <TData extends SST_RowData>(
  rowA: Row<any, TData>,
  rowB: Row<any, TData>,
  columnId: string,
) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId] as RankingInfo,
      rowB.columnFiltersMeta[columnId] as RankingInfo,
    );
  }
  // Provide a fallback for when the item ranks are equal
  return dir === 0 ? sortFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export const SST_SortingFns = {
  ...sortFns,
  fuzzy,
};

export const rankGlobalFuzzy = <TData extends SST_RowData>(
  rowA: SST_Row<TData>,
  rowB: SST_Row<TData>,
) =>
  Math.max(...Object.values(rowB.columnFiltersMeta).map((v: any) => v.rank)) -
  Math.max(...Object.values(rowA.columnFiltersMeta).map((v: any) => v.rank));
