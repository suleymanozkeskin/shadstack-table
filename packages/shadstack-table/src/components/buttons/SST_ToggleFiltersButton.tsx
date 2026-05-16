import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_ToggleFiltersButtonProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  table: SST_TableInstance<TData>;
}

export const SST_ToggleFiltersButton = <TData extends SST_RowData>({
  table,
  ...rest
}: SST_ToggleFiltersButtonProps<TData>) => {
  const {
    getState,
    options: {
      icons: { FilterListIcon, FilterListOffIcon },
      localization,
    },
    setShowColumnFilters,
  } = table;
  const { showColumnFilters } = getState();

  const handleToggleShowFilters = () => {
    setShowColumnFilters(!showColumnFilters);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={localization.showHideFilters}
          onClick={handleToggleShowFilters}
          size="icon"
          variant="ghost"
          {...rest}
          title={undefined}
        >
          {showColumnFilters ? <FilterListOffIcon /> : <FilterListIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rest?.title ?? localization.showHideFilters}</TooltipContent>
    </Tooltip>
  );
};
