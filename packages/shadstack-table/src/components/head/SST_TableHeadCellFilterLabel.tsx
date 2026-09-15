import { getFilterLabel } from '../../utils/filter-labels';
import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Button } from '../../_ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { SST_TableHeadCellFilterContainer } from './SST_TableHeadCellFilterContainer';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';
import { getColumnFilterInfo, useDropdownOptions } from '../../utils/column.utils';
import { getValueAndLabel } from '../../utils/utils';

export interface SST_TableHeadCellFilterLabelProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableHeadCellFilterLabel = <TData extends SST_RowData = {}>({
  className,
  header,
  table,
  ...rest
}: SST_TableHeadCellFilterLabelProps<TData>) => {
  const {
    options: {
      columnFilterDisplayMode,
      icons: { FilterAltIcon },
      localization,
    },
    refs: { filterInputRefs },
    setShowColumnFilters,
  } = table;

  const { column } = header;
  const { columnDef } = column;

  const filterValue = column.getFilterValue();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const virtualRef = React.useMemo<React.RefObject<HTMLElement> | undefined>(
    () => (anchorEl ? { current: anchorEl } : undefined),
    [anchorEl],
  );

  const { currentFilterOption, isMultiSelectFilter, isRangeFilter, isSelectFilter } =
    getColumnFilterInfo({ header, table });

  const dropdownOptions = useDropdownOptions({ header, table });

  const getSelectLabel = (index?: number) =>
    getValueAndLabel(
      dropdownOptions?.find(
        (option) =>
          getValueAndLabel(option).value ===
          (index !== undefined && Array.isArray(filterValue) ? filterValue[index] : filterValue),
      ),
    ).label;

  const isFilterActive =
    (Array.isArray(filterValue) && filterValue.some(Boolean)) ||
    (!!filterValue && !Array.isArray(filterValue));

  const filterTooltip =
    columnFilterDisplayMode === 'popover' && !isFilterActive
      ? localization.filterByColumn?.replace('{column}', String(columnDef.header))
      : localization.filteringByColumn
          .replace('{column}', String(columnDef.header))
          .replace(
            '{filterType}',
            currentFilterOption ? (getFilterLabel(localization, currentFilterOption) ?? '') : '',
          )
          .replace(
            '{filterValue}',
            `"${
              Array.isArray(filterValue)
                ? filterValue
                    .map((value, index) => (isMultiSelectFilter ? getSelectLabel(index) : value))
                    .join(`" ${isRangeFilter ? localization.and : localization.or} "`)
                : isSelectFilter
                  ? getSelectLabel()
                  : String(filterValue ?? '')
            }"`,
          )
          .replace('" "', '');

  const isVisible =
    columnFilterDisplayMode === 'popover' ||
    (!!filterValue && !isRangeFilter) ||
    (isRangeFilter && Array.isArray(filterValue) && (!!filterValue[0] || !!filterValue[1]));

  if (!isVisible) return null;

  return (
    <>
      <span className="flex-none">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                if (columnFilterDisplayMode === 'popover') {
                  setAnchorEl(event.currentTarget);
                } else {
                  setShowColumnFilters(true);
                }

                queueMicrotask(() => {
                  const control = filterInputRefs.current?.[`${column.id}-0`];
                  control?.focus();

                  if (control && 'select' in control) control.select();
                });
                event.stopPropagation();
              }}
              size="icon"
              purpose="filter-indicator"
              emphasis={isFilterActive ? 'normal' : 'faint'}
              variant="ghost"
              {...rest}
              className={cn('ml-1', className)}
            >
              <FilterAltIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{filterTooltip}</TooltipContent>
        </Tooltip>
      </span>
      {columnFilterDisplayMode === 'popover' && (
        <Popover
          open={!!anchorEl}
          onOpenChange={(open) => {
            if (!open) setAnchorEl(null);
          }}
        >
          {virtualRef && <PopoverAnchor virtualRef={virtualRef} />}
          <PopoverContent
            align="center"
            side="bottom"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.key === 'Enter' && setAnchorEl(null)}
            className="w-auto overflow-visible p-4"
          >
            <SST_TableHeadCellFilterContainer header={header} table={table} />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
