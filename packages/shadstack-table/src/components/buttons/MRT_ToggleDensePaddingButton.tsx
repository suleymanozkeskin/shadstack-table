import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToggleDensePaddingButtonProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleDensePaddingButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleDensePaddingButtonProps<TData>) => {
  const {
    getState,
    options: {
      icons: { DensityLargeIcon, DensityMediumIcon, DensitySmallIcon },
      localization,
    },
    setDensity,
  } = table;
  const { density } = getState();

  const handleToggleDensePadding = () => {
    const nextDensity =
      density === 'comfortable' ? 'compact' : density === 'compact' ? 'spacious' : 'comfortable';
    setDensity(nextDensity);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={localization.toggleDensity}
          onClick={handleToggleDensePadding}
          size="icon"
          variant="ghost"
          {...rest}
          title={undefined}
        >
          {density === 'compact' ? (
            <DensitySmallIcon />
          ) : density === 'comfortable' ? (
            <DensityMediumIcon />
          ) : (
            <DensityLargeIcon />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rest?.title ?? localization.toggleDensity}</TooltipContent>
    </Tooltip>
  );
};
