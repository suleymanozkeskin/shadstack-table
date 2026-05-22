import { type DeepKeys, type Row } from '@tanstack/react-table';
import { type SST_Cell } from './cell';
import { type LiteralUnion } from './primitives';

export type SST_RowData = Record<string, any>;

export interface SST_RowModel<TData extends SST_RowData> {
  flatRows: SST_Row<TData>[];
  rows: SST_Row<TData>[];
  rowsById: { [key: string]: SST_Row<TData> };
}

export type SST_Row<TData extends SST_RowData> = Omit<
  Row<TData>,
  | '_valuesCache'
  | 'getAllCells'
  | 'getParentRow'
  | 'getParentRows'
  | 'getRow'
  | 'getVisibleCells'
  | 'subRows'
> & {
  _valuesCache: Record<LiteralUnion<string & DeepKeys<TData>>, any>;
  getAllCells: () => SST_Cell<TData>[];
  getParentRow: () => SST_Row<TData> | null;
  getParentRows: () => SST_Row<TData>[];
  getRow: () => SST_Row<TData>;
  getVisibleCells: () => SST_Cell<TData>[];
  subRows?: SST_Row<TData>[];
};
