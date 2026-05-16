import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_ToggleGlobalFilterButtonProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  table: SST_TableInstance<TData>;
}

export const SST_ToggleGlobalFilterButton = <TData extends SST_RowData>({
  table,
  ...rest
}: SST_ToggleGlobalFilterButtonProps<TData>) => {
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
