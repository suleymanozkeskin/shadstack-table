import { setElementRef } from '../../utils/refs';
import { getFilterLabel } from '../../utils/filter-labels';
import * as React from 'react';
import { useState } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { isNumericFilterRange } from '../../utils/filter-input';
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

  // oxlint-disable-next-line no-underscore-dangle -- _filterFn is the canonical internal property carried over from upstream MRT/TanStack column def shape
  const currentFilterOption = columnDef._filterFn;

  const showChangeModeButton =
    enableColumnFilterModes && columnDef.enableColumnFilterModes !== false;

  const sliderProps = {
    ...parseFromValuesOrFunc(slotProps?.filterSlider, { column, table }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.filterSlider, { column, table }),
    ...rest,
  };

  const [min, max] =
    sliderProps.min !== undefined && sliderProps.max !== undefined
      ? [sliderProps.min, sliderProps.max]
      : (column.getFacetedMinMaxValues() ?? [0, 1]);

  const columnFilterValue = column.getFilterValue();
  const supported = columnFilterValue === undefined || isNumericFilterRange(columnFilterValue);

  const [filterValues, setFilterValues] = useState<number[]>(() =>
    isNumericFilterRange(columnFilterValue) ? columnFilterValue : [min, max],
  );

  const [previous, setPrevious] = useState({ value: columnFilterValue, min, max });

  if (previous.value !== columnFilterValue || previous.min !== min || previous.max !== max) {
    setPrevious({ value: columnFilterValue, min, max });
    setFilterValues(isNumericFilterRange(columnFilterValue) ? columnFilterValue : [min, max]);
  }

  // prevent moving the focus to the next/prev cell when using the arrow keys
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.stopPropagation();
    }
  };

  const handleValueCommit = (value: number[]) => {
    if (value[0] <= min && value[1] >= max) {
      // entire range selected → clear filter
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(value);
    }
  };

  if (!supported) {
    return (
      <p role="alert">
        The range slider requires two finite numbers. Use a custom Filter for this value.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <Slider
        max={max}
        min={min}
        minStepsBetweenThumbs={1}
        onKeyDown={handleKeyDown}
        onValueChange={(values) => setFilterValues(values)}
        onValueCommit={handleValueCommit}
        value={filterValues}
        {...sliderProps}
        ref={composeRefs(sliderProps.ref, (node) => {
          setElementRef(filterInputRefs, `${column.id}-0`, node);
        })}
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
            getFilterLabel(localization, currentFilterOption) ?? '',
          )}
        </p>
      ) : null}
    </div>
  );
};
