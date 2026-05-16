import * as React from 'react';
import { useState } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToggleFullScreenButtonProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleFullScreenButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleFullScreenButtonProps<TData>) => {
  const {
    getState,
    options: {
      icons: { FullscreenExitIcon, FullscreenIcon },
      localization,
    },
    setIsFullScreen,
  } = table;
  const { isFullScreen } = getState();

  const [tooltipOpened, setTooltipOpened] = useState(false);

  const handleToggleFullScreen = () => {
    setTooltipOpened(false);
    setIsFullScreen(!isFullScreen);
  };

  return (
    <Tooltip open={tooltipOpened}>
      <TooltipTrigger asChild>
        <Button
          aria-label={localization.toggleFullScreen}
          onBlur={() => setTooltipOpened(false)}
          onClick={handleToggleFullScreen}
          onFocus={() => setTooltipOpened(true)}
          onMouseEnter={() => setTooltipOpened(true)}
          onMouseLeave={() => setTooltipOpened(false)}
          size="icon"
          variant="ghost"
          {...rest}
          title={undefined}
        >
          {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rest?.title ?? localization.toggleFullScreen}</TooltipContent>
    </Tooltip>
  );
};
