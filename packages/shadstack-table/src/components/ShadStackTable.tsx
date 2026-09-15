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
): props is TableInstanceProp<TData> => props.table !== undefined;

const TableWithOptions = <TData extends SST_RowData>(props: SST_TableOptions<TData>) => {
  const table = useShadStackTable(props);

  return <SST_TablePaper table={table} />;
};

export const ShadStackTable = <TData extends SST_RowData>(props: ShadStackTableProps<TData>) => {
  if (isTableInstanceProp(props)) {
    return <SST_TablePaper table={props.table} />;
  }

  return <TableWithOptions {...props} />;
};
