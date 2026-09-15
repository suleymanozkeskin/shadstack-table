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
          purpose="grip"
          emphasis={location === 'row' ? 'normal' : 'subtle'}
          {...rest}
          onClick={(e) => {
            e.stopPropagation();
            rest?.onClick?.(e);
          }}
          className={cn('-mx-0.5', className)}
          title={undefined}
        >
          <DragHandleIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{rest?.title ?? localization.move}</TooltipContent>
    </Tooltip>
  );
};
