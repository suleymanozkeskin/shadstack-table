// oxlint-disable eslint/no-underscore-dangle -- intentional; revisit when refactoring
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Slider } from '../../_ui/slider';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_FilterRangeSliderProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Slider
> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_FilterRangeSlider = <TData extends SST_RowData>({
  className,
  header,
  table,
  ...rest
}: SST_FilterRangeSliderProps<TData>) => {
  const {
    options: { enableColumnFilterModes, localization, slotProps },
    refs: { filterInputRefs },
  } = table;
  const { column } = header;
  const { columnDef } = column;

  const currentFilterOption = columnDef._filterFn;

  const showChangeModeButton =
    enableColumnFilterModes && columnDef.enableColumnFilterModes !== false;

  const sliderProps = {
    ...parseFromValuesOrFunc(slotProps?.filterSlider, { column, table }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.filterSlider, { column, table }),
    ...rest,
  };

  let [min, max] =
    sliderProps.min !== undefined && sliderProps.max !== undefined
      ? [sliderProps.min, sliderProps.max]
      : (column.getFacetedMinMaxValues() ?? [0, 1]);

  //fix potential TanStack Table bugs where min or max is an array
  if (Array.isArray(min)) min = min[0];
  if (Array.isArray(max)) max = max[0];
  if (min === null) min = 0;
  if (max === null) max = 1;

  const [filterValues, setFilterValues] = useState<number[]>([min, max]);
  const columnFilterValue = column.getFilterValue();

  const isMounted = useRef(false);

  // prevent moving the focus to the next/prev cell when using the arrow keys
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.stopPropagation();
    }
  };

  useEffect(() => {
    if (isMounted.current) {
      if (columnFilterValue === undefined) {
        setFilterValues([min, max]);
      } else if (Array.isArray(columnFilterValue)) {
        setFilterValues(columnFilterValue);
      }
    }
    isMounted.current = true;
  }, [columnFilterValue, min, max]);

  const handleValueCommit = (value: number[]) => {
    if (value[0] <= min && value[1] >= max) {
      // entire range selected → clear filter
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(value as [number, number]);
    }
  };

  return (
    <div className="flex flex-col">
      <Slider
        max={max}
        min={min}
        minStepsBetweenThumbs={1}
        onKeyDown={handleKeyDown}
        onValueChange={(values) => setFilterValues(values)}
        onValueCommit={handleValueCommit}
        ref={(node) => {
          if (node) {
            // Radix Slider Root is a span; we keep a reference for focus management
            filterInputRefs.current![`${column.id}-0`] = node as unknown as HTMLInputElement;
          }
        }}
        value={filterValues}
        {...sliderProps}
        className={cn(
          'mx-auto px-1',
          showChangeModeButton ? 'mt-1.5' : 'mt-2.5',
          'w-[calc(100%-8px)]',
          className,
          sliderProps?.className,
        )}
        style={{
          minWidth: `${column.getSize() - 50}px`,
          ...sliderProps?.style,
        }}
      />
      {showChangeModeButton ? (
        <p className="text-xs leading-[0.8rem] m-[-3px_-6px] whitespace-nowrap text-muted-foreground">
          {localization.filterMode.replace(
            '{filterType}',
            localization[
              `filter${
                currentFilterOption?.charAt(0)?.toUpperCase() + currentFilterOption?.slice(1)
              }` as keyof typeof localization
            ] ?? '',
          )}
        </p>
      ) : null}
    </div>
  );
};
