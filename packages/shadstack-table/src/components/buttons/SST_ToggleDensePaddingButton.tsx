import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_ToggleDensePaddingButtonProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  table: SST_TableInstance<TData>;
}

export const SST_ToggleDensePaddingButton = <TData extends SST_RowData>({
  table,
  ...rest
}: SST_ToggleDensePaddingButtonProps<TData>) => {
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
