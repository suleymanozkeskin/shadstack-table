import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { type RowPinningPosition } from '@tanstack/react-table';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_RowPinButtonProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Button
> {
  pinningPosition: RowPinningPosition;
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_RowPinButton = <TData extends MRT_RowData>({
  className,
  pinningPosition,
  row,
  table,
  ...rest
}: MRT_RowPinButtonProps<TData>) => {
  const {
    options: {
      icons: { CloseIcon, PushPinIcon },
      localization,
      rowPinningDisplayMode,
    },
  } = table;

  const isPinned = row.getIsPinned();

  const [tooltipOpened, setTooltipOpened] = useState(false);

  const handleTogglePin = (event: MouseEvent<HTMLButtonElement>) => {
    setTooltipOpened(false);
    event.stopPropagation();
    row.pin(isPinned ? false : pinningPosition);
  };

  return (
    <Tooltip open={tooltipOpened}>
      <TooltipTrigger asChild>
        <Button
          aria-label={localization.pin}
          onBlur={() => setTooltipOpened(false)}
          onClick={handleTogglePin}
          onFocus={() => setTooltipOpened(true)}
          onMouseEnter={() => setTooltipOpened(true)}
          onMouseLeave={() => setTooltipOpened(false)}
          size="icon"
          variant="ghost"
          {...rest}
          className={cn('h-6 w-6', className)}
        >
          {isPinned ? (
            <CloseIcon />
          ) : (
            <PushPinIcon
              style={{
                transform: `rotate(${
                  rowPinningDisplayMode === 'sticky' ? 135 : pinningPosition === 'top' ? 180 : 0
                }deg)`,
              }}
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isPinned ? localization.unpin : localization.pin}</TooltipContent>
    </Tooltip>
  );
};
