import { SST_SelectCheckbox } from '../../components/inputs/SST_SelectCheckbox';
import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

export const getSST_RowSelectColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  const { enableMultiRowSelection, enableSelectAll } = tableOptions;

  return {
    Cell: ({ row, staticRowIndex, table }) => (
      <SST_SelectCheckbox row={row} staticRowIndex={staticRowIndex} table={table} />
    ),
    Header:
      enableSelectAll && enableMultiRowSelection
        ? ({ table }) => <SST_SelectCheckbox table={table} />
        : undefined,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'select',
      id: 'mrt-row-select',
      size: enableSelectAll ? 60 : 70,
      tableOptions,
    }),
  };
};
