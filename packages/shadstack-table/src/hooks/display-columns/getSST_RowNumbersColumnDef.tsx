import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

export const getSST_RowNumbersColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  const { localization, rowNumberDisplayMode } = tableOptions;

  return {
    //pagination is read live at cell render time rather than baked in at
    //factory time: the factory reruns only when the host re-renders, and the
    //host does not subscribe to pagination. Any pagination change that
    //affects the displayed number also changes the rendered rows, so the
    //cell is guaranteed to re-render with a fresh read.
    Cell: ({ row, staticRowIndex, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (
        ((rowNumberDisplayMode === 'static'
          ? (staticRowIndex || 0) + (pageSize || 0) * (pageIndex || 0)
          : row.index) ?? 0) + 1
      );
    },
    Header: () => localization.rowNumber,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'rowNumbers',
      id: 'sst-row-numbers',
      size: 50,
      tableOptions,
    }),
  };
};
