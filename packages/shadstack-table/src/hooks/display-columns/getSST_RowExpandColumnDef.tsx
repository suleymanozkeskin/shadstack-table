import { type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { SST_ExpandAllButton } from '../../components/buttons/SST_ExpandAllButton';
import { SST_ExpandButton } from '../../components/buttons/SST_ExpandButton';
import { type SST_ColumnDef, type SST_RowData, type SST_StatefulTableOptions } from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

export const getSST_RowExpandColumnDef = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): SST_ColumnDef<TData> => {
  const {
    defaultColumn,
    enableExpandAll,
    groupedColumnMode,
    positionExpandColumn,
    renderDetailPanel,
    state: { grouping },
  } = tableOptions;

  const alignProps =
    positionExpandColumn === 'last'
      ? ({
          className: 'text-right',
        } as const)
      : undefined;

  return {
    Cell: ({ cell, column, row, staticRowIndex, table }) => {
      const expandButtonProps = { row, staticRowIndex, table };
      const subRowsLength = row.subRows?.length;
      if (groupedColumnMode === 'remove' && row.groupingColumnId) {
        return (
          <div className="flex flex-row items-center gap-1">
            <SST_ExpandButton {...expandButtonProps} />
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{row.groupingValue as ReactNode}</span>
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
            {column.columnDef.GroupedCell?.({ cell, column, row, table })}
          </>
        );
      }
    },
    Header: enableExpandAll
      ? ({ table }) => {
          return (
            <>
              <SST_ExpandAllButton table={table} />
              {groupedColumnMode === 'remove' &&
                grouping
                  ?.map((groupedColumnId) => table.getColumn(groupedColumnId).columnDef.header)
                  ?.join(', ')}
            </>
          );
        }
      : undefined,
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
