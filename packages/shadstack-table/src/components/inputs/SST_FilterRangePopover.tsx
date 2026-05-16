import * as React from 'react';
import { Button } from '../../_ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../_ui/popover';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';
import { SST_FilterTextField } from './SST_FilterTextField';

export interface SST_FilterRangePopoverProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

const formatBound = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
};

export const SST_FilterRangePopover = <TData extends SST_RowData>({
  className,
  header,
  table,
  ...rest
}: SST_FilterRangePopoverProps<TData>) => {
  const {
    options: {
      icons: { FilterListIcon },
      localization,
    },
  } = table;
  const { column } = header;
  const { columnDef } = column;

  const filterValue = column.getFilterValue();
  const [rawMin, rawMax] = Array.isArray(filterValue) ? filterValue : [undefined, undefined];
  const minLabel = formatBound(rawMin);
  const maxLabel = formatBound(rawMax);
  const hasValue = minLabel !== null || maxLabel !== null;

  const columnLabel = localization.filterByColumn?.replace('{column}', String(columnDef.header));

  return (
    <div {...rest} className={cn('w-full', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'flex h-9 w-full items-center justify-between gap-2 px-3 font-normal',
              !hasValue && 'text-muted-foreground',
            )}
            aria-label={columnLabel}
            title={columnLabel}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {`${minLabel ?? localization.min} – ${maxLabel ?? localization.max}`}
            </span>
            <FilterListIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start" sideOffset={6}>
          <div className="flex w-full items-start gap-2">
            {[0, 1].map((rangeFilterIndex) => (
              <div key={rangeFilterIndex} className="min-w-0 flex-1">
                <SST_FilterTextField
                  header={header}
                  rangeFilterIndex={rangeFilterIndex}
                  table={table}
                />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
