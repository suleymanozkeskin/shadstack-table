import { type Row } from '@tanstack/react-table';
import { type SST_Features } from '../features';
import { type SST_Cell } from './cell';

export type SST_RowData = object;

export interface SST_RowModel<TData extends SST_RowData> {
  flatRows: SST_Row<TData>[];
  rows: SST_Row<TData>[];
  rowsById: { [key: string]: SST_Row<TData> };
}

export type SST_Row<TData extends SST_RowData> = Omit<
  Row<SST_Features, TData>,
  '_valuesCache' | 'getAllCells' | 'getParentRow' | 'getParentRows' | 'getVisibleCells' | 'subRows'
> & {
  /** @internal TanStack owns this cache. Editor text is stored separately. */
  _valuesCache: Row<SST_Features, TData>['_valuesCache'];
  getAllCells: () => SST_Cell<TData>[];
  getParentRow: () => SST_Row<TData> | undefined;
  getParentRows: () => SST_Row<TData>[];
  getVisibleCells: () => SST_Cell<TData>[];
  subRows: SST_Row<TData>[];
};
