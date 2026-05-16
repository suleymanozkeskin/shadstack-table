import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { MRT_ShowHideColumnsMenu } from '../menus/MRT_ShowHideColumnsMenu';

export interface MRT_ShowHideColumnsButtonProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ShowHideColumnsButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ShowHideColumnsButtonProps<TData>) => {
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
        <MRT_ShowHideColumnsMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} table={table} />
      )}
    </>
  );
};
