import * as React from 'react';
import { type DragEventHandler } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_GrabHandleButtonProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Button
> {
  iconButtonProps?: React.ComponentProps<typeof Button>;
  location?: 'column' | 'row';
  onDragEnd: DragEventHandler<HTMLButtonElement>;
  onDragStart: DragEventHandler<HTMLButtonElement>;
  table: MRT_TableInstance<TData>;
}

export const MRT_GrabHandleButton = <TData extends MRT_RowData>({
  className,
  location,
  table,
  ...rest
}: MRT_GrabHandleButtonProps<TData>) => {
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
