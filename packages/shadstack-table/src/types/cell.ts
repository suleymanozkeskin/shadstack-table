import { type Cell } from '@tanstack/react-table';
import { type SST_Features } from '../features';
import { type SST_Column } from './column';
import { type SST_Row, type SST_RowData } from './row';

export type SST_Cell<TData extends SST_RowData, TValue = unknown> = Omit<
  Cell<SST_Features, TData, TValue>,
  'column' | 'row'
> & {
  column: SST_Column<TData, TValue>;
  row: SST_Row<TData>;
};
