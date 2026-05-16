import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_ColumnActionMenu } from '../menus/SST_ColumnActionMenu';

export interface SST_TableHeadCellColumnActionsButtonProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableHeadCellColumnActionsButton = <TData extends SST_RowData>({
  className,
  header,
  table,
  ...rest
}: SST_TableHeadCellColumnActionsButtonProps<TData>) => {
  const {
    options: {
      icons: { MoreVertIcon },
      localization,
      slotProps,
    },
  } = table;
  const { column } = header;
  const { columnDef } = column;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openColumnActionsMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const iconButtonProps = {
    ...parseFromValuesOrFunc(slotProps?.columnActionsButton, {
      column,
      table,
    }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.columnActionsButton, {
      column,
      table,
    }),
    ...rest,
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={localization.columnActions}
            onClick={openColumnActionsMenu}
            size="icon"
            variant="ghost"
            {...iconButtonProps}
            className={cn(
              'h-6 w-6 opacity-50 transition-opacity duration-150 hover:opacity-100',
              className,
              iconButtonProps?.className,
            )}
            title={undefined}
          >
            {iconButtonProps?.children ?? <MoreVertIcon className="size-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {iconButtonProps?.title ?? localization.columnActions}
        </TooltipContent>
      </Tooltip>
      {anchorEl && (
        <SST_ColumnActionMenu
          anchorEl={anchorEl}
          header={header}
          setAnchorEl={setAnchorEl}
          table={table}
        />
      )}
    </>
  );
};
