import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToggleFiltersButtonProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleFiltersButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleFiltersButtonProps<TData>) => {
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
