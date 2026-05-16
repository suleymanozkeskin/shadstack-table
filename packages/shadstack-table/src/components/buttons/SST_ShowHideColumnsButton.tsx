import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { SST_ShowHideColumnsMenu } from '../menus/SST_ShowHideColumnsMenu';

export interface SST_ShowHideColumnsButtonProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  table: SST_TableInstance<TData>;
}

export const SST_ShowHideColumnsButton = <TData extends SST_RowData>({
  table,
  ...rest
}: SST_ShowHideColumnsButtonProps<TData>) => {
  const {
    options: {
      icons: { ViewColumnIcon },
      localization,
    },
  } = table;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openShowHideColumnsMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={localization.showHideColumns}
            onClick={openShowHideColumnsMenu}
            size="icon"
            variant="ghost"
            {...rest}
            title={undefined}
          >
            <ViewColumnIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{rest?.title ?? localization.showHideColumns}</TooltipContent>
      </Tooltip>
      {anchorEl && (
        <SST_ShowHideColumnsMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} table={table} />
      )}
    </>
  );
};
