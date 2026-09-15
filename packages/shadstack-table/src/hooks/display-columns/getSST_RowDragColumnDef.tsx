import { SST_TableBodyRowGrabHandle } from '../../components/body/SST_TableBodyRowGrabHandle';
import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

const RowDragCell = <TData extends SST_RowData>({
  row,
  rowRef,
  table,
}: Parameters<NonNullable<SST_ColumnDef<TData>['Cell']>>[0]) =>
  rowRef ? <SST_TableBodyRowGrabHandle row={row} rowRef={rowRef} table={table} /> : null;

export const getSST_RowDragColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  return {
    Cell: RowDragCell,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'move',
      id: 'sst-row-drag',
      size: 60,
      tableOptions,
    }),
  };
};
