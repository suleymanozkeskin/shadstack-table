import * as React from 'react';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { SST_ShowHideColumnsButton } from '../buttons/SST_ShowHideColumnsButton';
import { SST_ToggleDensePaddingButton } from '../buttons/SST_ToggleDensePaddingButton';
import { SST_ToggleFiltersButton } from '../buttons/SST_ToggleFiltersButton';
import { SST_ToggleFullScreenButton } from '../buttons/SST_ToggleFullScreenButton';
import { SST_ToggleGlobalFilterButton } from '../buttons/SST_ToggleGlobalFilterButton';

export interface SST_ToolbarInternalButtonsProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  table: SST_TableInstance<TData>;
}

export const SST_ToolbarInternalButtons = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_ToolbarInternalButtonsProps<TData>) => {
  const {
    options: {
      columnFilterDisplayMode,
      enableColumnFilters,
      enableColumnOrdering,
      enableColumnPinning,
      enableDensityToggle,
      enableFilters,
      enableFullScreenToggle,
      enableGlobalFilter,
      enableHiding,
      initialState,
      renderToolbarInternalActions,
    },
  } = table;

  return (
    <div {...rest} className={cn('flex items-center gap-1 z-[3]', className)}>
      {renderToolbarInternalActions?.({
        table,
      }) ?? (
        <>
          {enableFilters && enableGlobalFilter && !initialState?.showGlobalFilter && (
            <SST_ToggleGlobalFilterButton table={table} />
          )}
          {enableFilters && enableColumnFilters && columnFilterDisplayMode !== 'popover' && (
            <SST_ToggleFiltersButton table={table} />
          )}
          {(enableHiding || enableColumnOrdering || enableColumnPinning) && (
            <SST_ShowHideColumnsButton table={table} />
          )}
          {enableDensityToggle && <SST_ToggleDensePaddingButton table={table} />}
          {enableFullScreenToggle && <SST_ToggleFullScreenButton table={table} />}
        </>
      )}
    </div>
  );
};
