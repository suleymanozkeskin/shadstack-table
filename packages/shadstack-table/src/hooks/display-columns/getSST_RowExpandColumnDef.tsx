import { getDefaultCellValue } from '../../utils/cell-display';
import { flexRender } from '../../utils/tanstack.helpers';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { SST_ExpandAllButton } from '../../components/buttons/SST_ExpandAllButton';
import { SST_ExpandButton } from '../../components/buttons/SST_ExpandButton';
import {
  type SST_ColumnDef,
  type SST_RowData,
  type SST_TableInstance,
  type SST_StatefulTableOptions,
} from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

const RowExpandCell = <TData extends SST_RowData>({
  cell,
  column,
  row,
  staticRowIndex,
  table,
}: Parameters<NonNullable<SST_ColumnDef<TData>['Cell']>>[0]) => {
  const { groupedColumnMode } = table.options;
  const expandButtonProps = { row, staticRowIndex, table };
  const subRowsLength = row.subRows?.length;

  if (groupedColumnMode === 'remove' && row.groupingColumnId) {
    return (
      <div className="flex flex-row items-center gap-1">
        <SST_ExpandButton {...expandButtonProps} />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{getDefaultCellValue(row.groupingValue)}</span>
          </TooltipTrigger>
          <TooltipContent side="right">
            {table.getColumn(row.groupingColumnId).columnDef.header}
          </TooltipContent>
        </Tooltip>
        {!!subRowsLength && <span>({subRowsLength})</span>}
      </div>
    );
  } else {
    return (
      <>
        <SST_ExpandButton {...expandButtonProps} />
        {flexRender(column.columnDef.GroupedCell, { cell, column, row, table })}
      </>
    );
  }
};

const RowExpandHeader = <TData extends SST_RowData>({
  table,
}: {
  table: SST_TableInstance<TData>;
}) => (
  <>
    <SST_ExpandAllButton table={table} />
    {table.options.groupedColumnMode === 'remove' &&
      table
        .getState()
        .grouping.map((id) => table.getColumn(id).columnDef.header)
        .join(', ')}
  </>
);

export const getSST_RowExpandColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  const {
    defaultColumn,
    enableExpandAll,
    groupedColumnMode,
    positionExpandColumn,
    renderDetailPanel,
  } = tableOptions;

  const alignProps =
    positionExpandColumn === 'last'
      ? ({
          className: 'text-right',
        } as const)
      : undefined;

  return {
    Cell: RowExpandCell,
    Header: enableExpandAll ? RowExpandHeader : undefined,
    slotProps: {
      tableBodyCell: alignProps,
      tableHeadCell: alignProps,
    },
    ...defaultDisplayColumnProps({
      header: 'expand',
      id: 'sst-row-expand',
      size:
        groupedColumnMode === 'remove'
          ? (defaultColumn?.size ?? 180)
          : renderDetailPanel
            ? enableExpandAll
              ? 60
              : 70
            : 100,
      tableOptions,
    }),
  };
};
