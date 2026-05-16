import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Header, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_ColumnActionMenu } from '../menus/MRT_ColumnActionMenu';

export interface MRT_TableHeadCellColumnActionsButtonProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCellColumnActionsButton = <TData extends MRT_RowData>({
  className,
  header,
  table,
  ...rest
}: MRT_TableHeadCellColumnActionsButtonProps<TData>) => {
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
              'h-8 w-8 -my-2 -mx-1 opacity-30 transition-all duration-150 hover:opacity-100',
              className,
              iconButtonProps?.className,
            )}
            title={undefined}
          >
            {iconButtonProps?.children ?? <MoreVertIcon style={{ transform: 'scale(0.9)' }} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {iconButtonProps?.title ?? localization.columnActions}
        </TooltipContent>
      </Tooltip>
      {anchorEl && (
        <MRT_ColumnActionMenu
          anchorEl={anchorEl}
          header={header}
          setAnchorEl={setAnchorEl}
          table={table}
        />
      )}
    </>
  );
};
