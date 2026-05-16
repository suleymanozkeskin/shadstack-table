import { SST_TableBodyRowPinButton } from '../../components/body/SST_TableBodyRowPinButton';
import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

export const getSST_RowPinningColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  return {
    Cell: ({ row, table }) => <SST_TableBodyRowPinButton row={row} table={table} />,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'pin',
      id: 'mrt-row-pin',
      size: 60,
      tableOptions,
    }),
  };
};
