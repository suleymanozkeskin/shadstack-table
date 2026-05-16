import { useShadStackTable } from '../hooks/useShadStackTable';
import {
  type SST_RowData,
  type SST_TableInstance,
  type SST_TableOptions,
  type Xor,
} from '../types';
import { SST_TablePaper } from './table/SST_TablePaper';

type TableInstanceProp<TData extends SST_RowData> = {
  table: SST_TableInstance<TData>;
};

export type ShadStackTableProps<TData extends SST_RowData> = Xor<
  TableInstanceProp<TData>,
  SST_TableOptions<TData>
>;

const isTableInstanceProp = <TData extends SST_RowData>(
  props: ShadStackTableProps<TData>,
): props is TableInstanceProp<TData> => (props as TableInstanceProp<TData>).table !== undefined;

export const ShadStackTable = <TData extends SST_RowData>(props: ShadStackTableProps<TData>) => {
  let table: SST_TableInstance<TData>;

  if (isTableInstanceProp(props)) {
    table = props.table;
  } else {
    table = useShadStackTable(props);
  }

  return <SST_TablePaper table={table} />;
};
