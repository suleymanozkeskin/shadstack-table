import { type RefObject } from 'react';
import { SST_TableBodyRowGrabHandle } from '../../components/body/SST_TableBodyRowGrabHandle';
import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

export const getSST_RowDragColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  return {
    Cell: ({ row, rowRef, table }) => (
      <SST_TableBodyRowGrabHandle
        row={row}
        rowRef={rowRef as RefObject<HTMLTableRowElement | null>}
        table={table}
      />
    ),
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'move',
      id: 'sst-row-drag',
      size: 60,
      tableOptions,
    }),
  };
};
