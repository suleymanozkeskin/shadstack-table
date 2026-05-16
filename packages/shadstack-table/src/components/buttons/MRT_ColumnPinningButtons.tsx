import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Column, type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ColumnPinningButtonsProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'div'> {
  column: MRT_Column<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_ColumnPinningButtons = <TData extends MRT_RowData>({
  className,
  column,
  table,
  ...rest
}: MRT_ColumnPinningButtonsProps<TData>) => {
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
