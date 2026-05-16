import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Column, type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_ColumnPinningButtonsProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  column: SST_Column<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_ColumnPinningButtons = <TData extends SST_RowData>({
  className,
  column,
  table,
  ...rest
}: SST_ColumnPinningButtonsProps<TData>) => {
  const {
    options: {
      icons: { PushPinIcon },
      localization,
    },
  } = table;

  const handlePinColumn = (pinDirection: 'left' | 'right' | false) => {
    column.pin(pinDirection);
  };

  return (
    <div className={cn('min-w-[70px] text-center', className)} {...rest}>
      {column.getIsPinned() ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => handlePinColumn(false)} size="icon" variant="ghost">
              <PushPinIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{localization.unpin}</TooltipContent>
        </Tooltip>
      ) : (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => handlePinColumn('left')} size="icon" variant="ghost">
                <PushPinIcon style={{ transform: 'rotate(90deg)' }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{localization.pinToLeft}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => handlePinColumn('right')} size="icon" variant="ghost">
                <PushPinIcon style={{ transform: 'rotate(-90deg)' }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{localization.pinToRight}</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
};
