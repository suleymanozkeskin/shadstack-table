import { SST_DefaultDisplayColumn } from '../useSST_TableOptions';
import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

const blankColProps = {
  children: null,
  className: 'min-w-0 w-0 p-0',
};

export const getSST_RowSpacerColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  return {
    ...defaultDisplayColumnProps({
      id: 'mrt-row-spacer',
      size: 0,
      tableOptions,
    }),
    grow: true,
    ...SST_DefaultDisplayColumn,
    slotProps: {
      tableBodyCell: blankColProps,
      tableFooterCell: blankColProps,
      tableHeadCell: blankColProps,
    },
  };
};
