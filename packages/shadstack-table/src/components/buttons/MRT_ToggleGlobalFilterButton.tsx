import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToggleGlobalFilterButtonProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleGlobalFilterButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleGlobalFilterButtonProps<TData>) => {
  const {
    getState,
    options: {
      icons: { SearchIcon, SearchOffIcon },

      localization,
    },
    refs: { searchInputRef },
    setShowGlobalFilter,
  } = table;
  const { globalFilter, showGlobalFilter } = getState();

  const handleToggleSearch = () => {
    setShowGlobalFilter(!showGlobalFilter);
    queueMicrotask(() => searchInputRef.current?.focus());
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            aria-label={rest?.title ?? localization.showHideSearch}
            disabled={!!globalFilter && showGlobalFilter}
            onClick={handleToggleSearch}
            size="icon"
            variant="ghost"
            {...rest}
            title={undefined}
          >
            {showGlobalFilter ? <SearchOffIcon /> : <SearchIcon />}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{rest?.title ?? localization.showHideSearch}</TooltipContent>
    </Tooltip>
  );
};
