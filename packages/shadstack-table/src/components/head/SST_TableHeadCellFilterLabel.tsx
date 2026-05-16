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

  const filterValue = column.getFilterValue() as [string, string] | string;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const virtualRef = React.useMemo<React.RefObject<HTMLElement | null> | undefined>(
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
          (index !== undefined ? filterValue[index] : filterValue),
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
            currentFilterOption
              ? localization[
                  `filter${
                    currentFilterOption.charAt(0).toUpperCase() + currentFilterOption.slice(1)
                  }` as keyof typeof localization
                ]
              : '',
          )
          .replace(
            '{filterValue}',
            `"${
              Array.isArray(filterValue)
                ? (filterValue as [string, string])
                    .map((value, index) => (isMultiSelectFilter ? getSelectLabel(index) : value))
                    .join(`" ${isRangeFilter ? localization.and : localization.or} "`)
                : isSelectFilter
                  ? getSelectLabel()
                  : (filterValue as string)
            }"`,
          )
          .replace('" "', '');

  const isVisible =
    columnFilterDisplayMode === 'popover' ||
    (!!filterValue && !isRangeFilter) ||
    (isRangeFilter && (!!filterValue?.[0] || !!filterValue?.[1]));

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
                  filterInputRefs.current?.[`${column.id}-0`]?.focus?.();
                  filterInputRefs.current?.[`${column.id}-0`]?.select?.();
                });
                event.stopPropagation();
              }}
              size="icon"
              variant="ghost"
              {...rest}
              className={cn(
                'h-4 w-4 ml-1 p-2 transition-all duration-150 ease-in-out scale-75',
                isFilterActive ? 'opacity-100' : 'opacity-30',
                className,
              )}
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
          {virtualRef && <PopoverAnchor virtualRef={virtualRef as any} />}
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
