import * as React from 'react';
import { type DragEventHandler } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_GrabHandleButtonProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Button
> {
  iconButtonProps?: React.ComponentProps<typeof Button>;
  location?: 'column' | 'row';
  onDragEnd: DragEventHandler<HTMLButtonElement>;
  onDragStart: DragEventHandler<HTMLButtonElement>;
  table: SST_TableInstance<TData>;
}

export const SST_GrabHandleButton = <TData extends SST_RowData>({
  className,
  location,
  table,
  ...rest
}: SST_GrabHandleButtonProps<TData>) => {
  const {
    options: {
      icons: { DragHandleIcon },
      localization,
    },
  } = table;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={rest.title ?? localization.move}
          draggable="true"
          size="icon"
          variant="ghost"
          {...rest}
          onClick={(e) => {
            e.stopPropagation();
            rest?.onClick?.(e);
          }}
          className={cn(
            'cursor-grab active:cursor-grabbing transition-all duration-150 ease-in-out -mx-0.5 p-0.5 hover:bg-transparent',
            location === 'row' ? 'opacity-100' : 'opacity-50 hover:opacity-100',
            className,
          )}
          title={undefined}
        >
          <DragHandleIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{rest?.title ?? localization.move}</TooltipContent>
    </Tooltip>
  );
};
