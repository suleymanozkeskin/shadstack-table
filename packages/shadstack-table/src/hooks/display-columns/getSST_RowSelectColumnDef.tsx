import { SST_SelectCheckbox } from '../../components/inputs/SST_SelectCheckbox';
import {
  type SST_ColumnDef,
  type SST_RowData,
  type SST_TableInstance,
  type SST_StatefulTableOptions,
} from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

const RowSelectCell = <TData extends SST_RowData>({
  row,
  staticRowIndex,
  table,
}: Parameters<NonNullable<SST_ColumnDef<TData>['Cell']>>[0]) => (
  <SST_SelectCheckbox row={row} staticRowIndex={staticRowIndex} table={table} />
);

const RowSelectHeader = <TData extends SST_RowData>({
  table,
}: {
  table: SST_TableInstance<TData>;
}) => <SST_SelectCheckbox table={table} />;

export const getSST_RowSelectColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  const { enableMultiRowSelection, enableSelectAll } = tableOptions;

  return {
    Cell: RowSelectCell,
    Header: enableSelectAll && enableMultiRowSelection ? RowSelectHeader : undefined,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'select',
      id: 'sst-row-select',
      size: enableSelectAll ? 60 : 70,
      tableOptions,
    }),
  };
};
