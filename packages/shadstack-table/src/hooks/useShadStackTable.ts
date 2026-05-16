import { type SST_RowData, type SST_TableInstance, type SST_TableOptions } from '../types';
import { useSST_TableInstance } from './useSST_TableInstance';
import { useSST_TableOptions } from './useSST_TableOptions';

export const useShadStackTable = <TData extends SST_RowData>(
  tableOptions: SST_TableOptions<TData>,
): SST_TableInstance<TData> => useSST_TableInstance(useSST_TableOptions(tableOptions));
