// oxlint-disable eslint/no-shadow -- verbatim port of upstream MRT
// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
// oxlint-disable react/no-array-index-key -- verbatim port of upstream MRT
import * as React from 'react';
import { type ChangeEvent, type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '../../_ui/badge';
import { Button } from '../../_ui/button';
import { Checkbox } from '../../_ui/checkbox';
import { Input } from '../../_ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../_ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Header, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getColumnFilterInfo, useDropdownOptions } from '../../utils/column.utils';
import { getValueAndLabel, parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_FilterOptionMenu } from '../menus/MRT_FilterOptionMenu';

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

let warnedAutocomplete = false;

export interface MRT_FilterTextFieldProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Input
> {
  header: MRT_Header<TData>;
  rangeFilterIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_FilterTextField = <TData extends MRT_RowData>({
  className,
  header,
  rangeFilterIndex,
  table,
  ...rest
}: MRT_FilterTextFieldProps<TData>) => {
  const {
    options: {
      enableColumnFilterModes,
      icons: { CloseIcon, FilterListIcon },
      localization,
      manualFiltering,
      slotProps,
    },
    refs: { filterInputRefs },
    setColumnFilterFns,
  } = table;
  const { column } = header;
  const { columnDef } = column;
  const { filterVariant } = columnDef;

  const args = { column, rangeFilterIndex, table };

  const textFieldProps = {
    ...parseFromValuesOrFunc(slotProps?.filterInput, args),
    ...parseFromValuesOrFunc(columnDef.slotProps?.filterInput, args),
    ...rest,
  };

  const datePickerProps = {
    ...parseFromValuesOrFunc(slotProps?.filterDatePicker, args),
    ...parseFromValuesOrFunc(columnDef.slotProps?.filterDatePicker, args),
  };
  const dateTimePickerProps = {
    ...parseFromValuesOrFunc(slotProps?.filterDateTimePicker, args),
    ...parseFromValuesOrFunc(columnDef.slotProps?.filterDateTimePicker, args),
  };
  const timePickerProps = {
    ...parseFromValuesOrFunc(slotProps?.filterTimePicker, args),
    ...parseFromValuesOrFunc(columnDef.slotProps?.filterTimePicker, args),
  };

  const {
    allowedColumnFilterOptions,
    currentFilterOption,
    facetedUniqueValues,
    isAutocompleteFilter,
    isDateFilter,
    isMultiSelectFilter,
    isRangeFilter,
    isSelectFilter,
    isTextboxFilter,
  } = getColumnFilterInfo({ header, table });

  const dropdownOptions = useDropdownOptions({ header, table });

  if (isAutocompleteFilter && !warnedAutocomplete) {
    // eslint-disable-next-line no-console
    console.warn(
      '[shadstack-table] Autocomplete filter is not implemented; falling back to text input. Provide a custom Filter cell to override.',
    );
    warnedAutocomplete = true;
  }

  const filterChipLabel = ['empty', 'notEmpty'].includes(currentFilterOption)
    ? localization[
        `filter${
          currentFilterOption?.charAt?.(0)?.toUpperCase() + currentFilterOption?.slice(1)
        }` as keyof typeof localization
      ]
    : '';

  const filterPlaceholder = !isRangeFilter
    ? (textFieldProps?.placeholder ??
      localization.filterByColumn?.replace('{column}', String(columnDef.header)))
    : rangeFilterIndex === 0
      ? localization.min
      : rangeFilterIndex === 1
        ? localization.max
        : '';

  const showChangeModeButton = !!(
    enableColumnFilterModes &&
    columnDef.enableColumnFilterModes !== false &&
    !rangeFilterIndex &&
    (allowedColumnFilterOptions === undefined || !!allowedColumnFilterOptions?.length)
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filterValue, setFilterValue] = useState<string | string[]>(() =>
    isMultiSelectFilter
      ? (column.getFilterValue() as string[]) || []
      : isRangeFilter
        ? (column.getFilterValue() as [string, string])?.[rangeFilterIndex as number] || ''
        : ((column.getFilterValue() as string) ?? ''),
  );

  const handleChangeDebounced = useCallback(
    debounce(
      (newValue: any) => {
        if (isRangeFilter) {
          column.setFilterValue((old: Array<Date | null | number | string>) => {
            const newFilterValues = old ?? ['', ''];
            newFilterValues[rangeFilterIndex as number] = newValue ?? undefined;
            return newFilterValues;
          });
        } else {
          column.setFilterValue(newValue ?? undefined);
        }
      },
      isTextboxFilter ? (manualFiltering ? 400 : 200) : 1,
    ),
    [],
  );

  const handleChange = (newValue: any) => {
    setFilterValue(newValue ?? '');
    handleChangeDebounced(newValue);
  };

  const handleTextFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue =
      event.target.type === 'date'
        ? event.target.valueAsDate
        : event.target.type === 'number'
          ? event.target.valueAsNumber
          : event.target.value;
    handleChange(newValue);
    textFieldProps?.onChange?.(event);
  };

  const handleClear = () => {
    if (isMultiSelectFilter) {
      setFilterValue([]);
      column.setFilterValue([]);
    } else if (isRangeFilter) {
      setFilterValue('');
      column.setFilterValue((old: [string | undefined, string | undefined]) => {
        const newFilterValues = (Array.isArray(old) && old) || ['', ''];
        newFilterValues[rangeFilterIndex as number] = undefined;
        return newFilterValues;
      });
    } else {
      setFilterValue('');
      column.setFilterValue(undefined);
    }
  };

  const handleClearEmptyFilterChip = () => {
    setFilterValue('');
    column.setFilterValue(undefined);
    setColumnFilterFns((prev) => ({
      ...prev,
      [header.id]: allowedColumnFilterOptions?.[0] ?? 'fuzzy',
    }));
  };

  const handleFilterMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      const filterValue = column.getFilterValue();
      if (filterValue === undefined) {
        handleClear();
      } else if (isRangeFilter && rangeFilterIndex !== undefined) {
        setFilterValue((filterValue as [string, string])[rangeFilterIndex]);
      } else {
        setFilterValue(filterValue as string);
      }
    }
    isMounted.current = true;
  }, [column.getFilterValue()]);

  if (columnDef.Filter) {
    return <>{columnDef.Filter?.({ column, header, rangeFilterIndex, table })}</>;
  }

  // Date/time pickers → fallback to native input types
  const dateInputType = filterVariant?.startsWith('datetime')
    ? 'datetime-local'
    : filterVariant?.startsWith('date')
      ? 'date'
      : filterVariant?.startsWith('time')
        ? 'time'
        : null;

  const helperText = showChangeModeButton ? (
    <p className="text-xs leading-[0.8rem] whitespace-nowrap text-muted-foreground mt-0.5">
      {localization.filterMode.replace(
        '{filterType}',
        localization[
          `filter${
            currentFilterOption?.charAt(0)?.toUpperCase() + currentFilterOption?.slice(1)
          }` as keyof typeof localization
        ],
      )}
    </p>
  ) : null;

  const startAdornment = showChangeModeButton ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="absolute left-0 z-10 flex items-center pl-1">
          <Button
            aria-label={localization.changeFilterMode}
            onClick={handleFilterMenuOpen}
            size="icon"
            variant="ghost"
            className="h-7 w-7"
          >
            <FilterListIcon />
          </Button>
          {filterChipLabel ? (
            <Badge variant="secondary" className="ml-1 gap-1 pr-1">
              {filterChipLabel}
              <button
                type="button"
                onClick={handleClearEmptyFilterChip}
                className="ml-1 inline-flex items-center justify-center hover:opacity-80"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
        </span>
      </TooltipTrigger>
      <TooltipContent>{localization.changeFilterMode}</TooltipContent>
    </Tooltip>
  ) : null;

  const endAdornment =
    !isAutocompleteFilter && !isDateFilter && !filterChipLabel ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'absolute right-0 z-10 flex items-center pr-1',
              (filterValue?.length ?? 0) > 0 ? 'visible' : 'invisible',
              (isSelectFilter || isMultiSelectFilter) && 'mr-5',
            )}
          >
            <Button
              aria-label={localization.clearFilter}
              disabled={!filterValue?.toString()?.length}
              onClick={handleClear}
              size="icon"
              variant="ghost"
              className="h-8 w-8 scale-90"
            >
              <CloseIcon />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">{localization.clearFilter ?? ''}</TooltipContent>
      </Tooltip>
    ) : null;

  const wrapperClass = cn(
    'relative inline-flex items-center w-full',
    isDateFilter
      ? 'min-w-[160px]'
      : enableColumnFilterModes && rangeFilterIndex === 0
        ? 'min-w-[110px]'
        : isRangeFilter
          ? 'min-w-[100px]'
          : !filterChipLabel
            ? 'min-w-[120px]'
            : 'min-w-fit',
    '-mx-0.5',
  );

  const inputClass = cn(
    'w-full',
    showChangeModeButton && 'pl-9',
    endAdornment && 'pr-9',
    className,
    textFieldProps?.className,
  );

  const inputRefFn = (inputRef: HTMLInputElement | null) => {
    filterInputRefs.current![`${column.id}-${rangeFilterIndex ?? 0}`] = inputRef!;
    if (typeof textFieldProps.ref === 'function') textFieldProps.ref(inputRef);
  };

  const onSelectChange = (newValue: string) => handleChange(newValue);

  const filterField = dateInputType ? (
    <div className={wrapperClass}>
      {startAdornment}
      <Input
        aria-label={filterPlaceholder}
        autoComplete="off"
        placeholder={filterPlaceholder}
        type={dateInputType}
        title={filterPlaceholder}
        value={(filterValue as string) ?? ''}
        {...(filterVariant?.startsWith('time')
          ? timePickerProps
          : filterVariant?.startsWith('datetime')
            ? dateTimePickerProps
            : datePickerProps)}
        onChange={handleTextFieldChange}
        onKeyDown={(e) => {
          e.stopPropagation();
          textFieldProps.onKeyDown?.(e);
        }}
        onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
        ref={inputRefFn}
        className={inputClass}
      />
      {endAdornment}
    </div>
  ) : isSelectFilter || isMultiSelectFilter ? (
    <div className={wrapperClass}>
      {startAdornment}
      <Select
        value={Array.isArray(filterValue) ? filterValue.join(',') : (filterValue as string)}
        onValueChange={onSelectChange}
      >
        <SelectTrigger
          ref={inputRefFn as any}
          className={inputClass}
          aria-label={filterPlaceholder}
          title={filterPlaceholder}
        >
          <SelectValue placeholder={filterPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {dropdownOptions?.map((option) => {
            const { label, value } = getValueAndLabel(option);
            return (
              <SelectItem key={value} value={value}>
                <span className="flex items-center gap-2">
                  {isMultiSelectFilter && (
                    <Checkbox
                      checked={((column.getFilterValue() ?? []) as string[]).includes(value)}
                      className="mr-1"
                    />
                  )}
                  {label}
                  {!columnDef.filterSelectOptions && ` (${facetedUniqueValues.get(value)})`}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {endAdornment}
    </div>
  ) : (
    <div className={wrapperClass}>
      {startAdornment}
      <Input
        aria-label={filterPlaceholder}
        autoComplete="off"
        disabled={!!filterChipLabel}
        placeholder={filterChipLabel ? undefined : filterPlaceholder}
        title={filterPlaceholder}
        value={(filterValue as string) ?? ''}
        {...textFieldProps}
        onChange={handleTextFieldChange}
        onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          textFieldProps.onKeyDown?.(e);
        }}
        ref={inputRefFn}
        className={inputClass}
      />
      {endAdornment}
    </div>
  );

  return (
    <>
      {filterField}
      {helperText}
      <MRT_FilterOptionMenu
        anchorEl={anchorEl}
        header={header}
        setAnchorEl={setAnchorEl}
        setFilterValue={setFilterValue as (filterValue: any) => void}
        table={table}
      />
    </>
  );
};
