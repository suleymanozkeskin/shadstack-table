// oxlint-disable eslint/no-underscore-dangle -- verbatim port of upstream MRT
// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
// oxlint-disable react/no-array-index-key -- verbatim port of upstream MRT
import * as React from 'react';
import { useMemo } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { SST_ActionMenuItem } from './SST_ActionMenuItem';
import { cn } from '../../lib/utils';
import {
  type SST_FilterOption,
  type SST_Header,
  type SST_InternalFilterOption,
  type SST_Localization,
  type SST_RowData,
  type SST_TableInstance,
} from '../../types';

export const mrtFilterOptions = (localization: SST_Localization): SST_InternalFilterOption[] => [
  {
    divider: false,
    label: localization.filterFuzzy,
    option: 'fuzzy',
    symbol: '≈',
  },
  {
    divider: false,
    label: localization.filterContains,
    option: 'contains',
    symbol: '*',
  },
  {
    divider: false,
    label: localization.filterStartsWith,
    option: 'startsWith',
    symbol: 'a',
  },
  {
    divider: true,
    label: localization.filterEndsWith,
    option: 'endsWith',
    symbol: 'z',
  },
  {
    divider: false,
    label: localization.filterEquals,
    option: 'equals',
    symbol: '=',
  },
  {
    divider: true,
    label: localization.filterNotEquals,
    option: 'notEquals',
    symbol: '≠',
  },
  {
    divider: false,
    label: localization.filterBetween,
    option: 'between',
    symbol: '⇿',
  },
  {
    divider: true,
    label: localization.filterBetweenInclusive,
    option: 'betweenInclusive',
    symbol: '⬌',
  },
  {
    divider: false,
    label: localization.filterGreaterThan,
    option: 'greaterThan',
    symbol: '>',
  },
  {
    divider: false,
    label: localization.filterGreaterThanOrEqualTo,
    option: 'greaterThanOrEqualTo',
    symbol: '≥',
  },
  {
    divider: false,
    label: localization.filterLessThan,
    option: 'lessThan',
    symbol: '<',
  },
  {
    divider: true,
    label: localization.filterLessThanOrEqualTo,
    option: 'lessThanOrEqualTo',
    symbol: '≤',
  },
  {
    divider: false,
    label: localization.filterEmpty,
    option: 'empty',
    symbol: '∅',
  },
  {
    divider: false,
    label: localization.filterNotEmpty,
    option: 'notEmpty',
    symbol: '!∅',
  },
];

const rangeModes = ['between', 'betweenInclusive', 'inNumberRange'];
const emptyModes = ['empty', 'notEmpty'];
const arrModes = ['arrIncludesSome', 'arrIncludesAll', 'arrIncludes'];
const rangeVariants = ['range-slider', 'date-range', 'datetime-range', 'range'];

export interface SST_FilterOptionMenuProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof PopoverContent
> {
  anchorEl: HTMLElement | null;
  header?: SST_Header<TData>;
  onSelect?: () => void;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  setFilterValue?: (filterValue: any) => void;
  table: SST_TableInstance<TData>;
}

export const SST_FilterOptionMenu = <TData extends SST_RowData>({
  anchorEl,
  className,
  header,
  onSelect,
  setAnchorEl,
  setFilterValue,
  table,
  ...rest
}: SST_FilterOptionMenuProps<TData>) => {
  const {
    getState,
    options: {
      columnFilterModeOptions,
      globalFilterModeOptions,
      localization,
      mrtTheme: { menuBackgroundColor },
      renderColumnFilterModeMenuItems,
      renderGlobalFilterModeMenuItems,
    },
    setColumnFilterFns,
    setGlobalFilterFn,
  } = table;
  const { density, globalFilterFn } = getState();
  const { column } = header ?? {};
  const { columnDef } = column ?? {};
  const currentFilterValue = column?.getFilterValue();
  const virtualRef = useMemo<React.RefObject<HTMLElement | null> | undefined>(
    () => (anchorEl ? { current: anchorEl } : undefined),
    [anchorEl],
  );

  let allowedColumnFilterOptions = columnDef?.columnFilterModeOptions ?? columnFilterModeOptions;

  if (rangeVariants.includes(columnDef?.filterVariant as string)) {
    allowedColumnFilterOptions = [...rangeModes, ...(allowedColumnFilterOptions ?? [])].filter(
      (option) => rangeModes.includes(option),
    );
  }

  const internalFilterOptions = useMemo(
    () =>
      mrtFilterOptions(localization).filter((filterOption) =>
        columnDef
          ? allowedColumnFilterOptions === undefined ||
            allowedColumnFilterOptions?.includes(filterOption.option)
          : (!globalFilterModeOptions || globalFilterModeOptions.includes(filterOption.option)) &&
            ['contains', 'fuzzy', 'startsWith'].includes(filterOption.option),
      ),
    [],
  );

  const handleSelectFilterMode = (option: SST_FilterOption) => {
    const prevFilterMode = columnDef?._filterFn ?? '';
    if (!header || !column) {
      // global filter mode
      setGlobalFilterFn(option);
    } else if (option !== prevFilterMode) {
      // column filter mode
      setColumnFilterFns((prev: { [key: string]: any }) => ({
        ...prev,
        [header.id]: option,
      }));

      // reset filter value and/or perform new filter render
      if (emptyModes.includes(option)) {
        // will now be empty/notEmpty filter mode
        if (currentFilterValue !== ' ' && !emptyModes.includes(prevFilterMode)) {
          column.setFilterValue(' ');
        } else if (currentFilterValue) {
          column.setFilterValue(currentFilterValue); // perform new filter render
        }
      } else if (
        columnDef?.filterVariant === 'multi-select' ||
        arrModes.includes(option as string)
      ) {
        // will now be array filter mode
        if (currentFilterValue instanceof String || (currentFilterValue as Array<any>)?.length) {
          column.setFilterValue([]);
          setFilterValue?.([]);
        } else if (currentFilterValue) {
          column.setFilterValue(currentFilterValue); // perform new filter render
        }
      } else if (
        columnDef?.filterVariant?.includes('range') ||
        rangeModes.includes(option as SST_FilterOption)
      ) {
        // will now be range filter mode
        if (
          !Array.isArray(currentFilterValue) ||
          (!(currentFilterValue as Array<any>)?.every((v) => v === '') &&
            !rangeModes.includes(prevFilterMode))
        ) {
          column.setFilterValue(['', '']);
          setFilterValue?.('');
        } else {
          column.setFilterValue(currentFilterValue); // perform new filter render
        }
      } else {
        // will now be single value filter mode
        if (Array.isArray(currentFilterValue)) {
          column.setFilterValue('');
          setFilterValue?.('');
        } else if (currentFilterValue === ' ' && emptyModes.includes(prevFilterMode)) {
          column.setFilterValue(undefined);
        } else {
          column.setFilterValue(currentFilterValue); // perform new filter render
        }
      }
    }
    setAnchorEl(null);
    onSelect?.();
  };

  const filterOption = !!header && columnDef ? columnDef._filterFn : globalFilterFn;

  return (
    <Popover
      open={!!anchorEl}
      onOpenChange={(open) => {
        if (!open) setAnchorEl(null);
      }}
    >
      {virtualRef && <PopoverAnchor virtualRef={virtualRef as any} />}
      <PopoverContent
        side="right"
        align="center"
        sideOffset={4}
        style={{ backgroundColor: menuBackgroundColor }}
        className={cn('w-auto min-w-[8rem] p-1', density === 'compact' && 'text-xs', className)}
        {...rest}
      >
        {(header && column && columnDef
          ? (columnDef.renderColumnFilterModeMenuItems?.({
              column: column as any,
              internalFilterOptions,
              onSelectFilterMode: handleSelectFilterMode,
              table,
            }) ??
            renderColumnFilterModeMenuItems?.({
              column: column as any,
              internalFilterOptions,
              onSelectFilterMode: handleSelectFilterMode,
              table,
            }))
          : renderGlobalFilterModeMenuItems?.({
              internalFilterOptions,
              onSelectFilterMode: handleSelectFilterMode,
              table,
            })) ??
          internalFilterOptions.map(({ divider, label, option, symbol }) => (
            <SST_ActionMenuItem
              divider={divider}
              icon={symbol}
              key={option}
              label={label}
              onClick={() => handleSelectFilterMode(option as SST_FilterOption)}
              selected={option === filterOption}
              table={table}
              value={option}
            />
          ))}
      </PopoverContent>
    </Popover>
  );
};
