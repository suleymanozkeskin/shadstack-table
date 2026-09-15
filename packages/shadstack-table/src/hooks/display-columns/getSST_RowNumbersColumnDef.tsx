import {
  type SST_ColumnDef,
  type SST_RowData,
  type SST_TableInstance,
  type SST_StatefulTableOptions,
} from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

const RowNumberCell = <TData extends SST_RowData>({
  row,
  staticRowIndex,
  table,
}: Parameters<NonNullable<SST_ColumnDef<TData>['Cell']>>[0]) => {
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    (table.options.rowNumberDisplayMode === 'static'
      ? (staticRowIndex ?? 0) + pageSize * pageIndex
      : row.index) + 1
  );
};

const RowNumberHeader = <TData extends SST_RowData>({
  table,
}: {
  table: SST_TableInstance<TData>;
}) => table.options.localization.rowNumber;

export const getSST_RowNumbersColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  return {
    Cell: RowNumberCell,
    Header: RowNumberHeader,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'rowNumbers',
      id: 'sst-row-numbers',
      size: 50,
      tableOptions,
    }),
  };
};
