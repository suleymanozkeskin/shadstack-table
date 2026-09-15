import { SST_TableBodyRowPinButton } from '../../components/body/SST_TableBodyRowPinButton';
import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

const RowPinningCell = <TData extends SST_RowData>({
  row,
  table,
}: Parameters<NonNullable<SST_ColumnDef<TData>['Cell']>>[0]) => (
  <SST_TableBodyRowPinButton row={row} table={table} />
);

export const getSST_RowPinningColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  return {
    Cell: RowPinningCell,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'pin',
      id: 'sst-row-pin',
      size: 60,
      tableOptions,
    }),
  };
};
