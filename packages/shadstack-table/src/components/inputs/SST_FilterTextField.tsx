import * as React from 'react';
import { type ChangeEvent, type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '../../_ui/badge';
import { Button } from '../../_ui/button';
import { Checkbox } from '../../_ui/checkbox';
import { Input } from '../../_ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../_ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../_ui/select';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';
import { getColumnFilterInfo, useDropdownOptions } from '../../utils/column.utils';
import { debounce } from '../../utils/debounce';
import { getValueAndLabel, parseFromValuesOrFunc } from '../../utils/utils';
import { SST_FilterOptionMenu } from '../menus/SST_FilterOptionMenu';
import { SST_DateFilter } from './SST_DateFilter';

let warnedAutocomplete = false;

export interface SST_FilterTextFieldProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Input
> {
  header: SST_Header<TData>;
  rangeFilterIndex?: number;
  table: SST_TableInstance<TData>;
}

export const SST_FilterTextField = <TData extends SST_RowData>({
  className,
  header,
  rangeFilterIndex,
  table,
  ...rest
}: SST_FilterTextFieldProps<TData>) => {
  const {
    options: {
      enableColumnFilterModes,
      icons: { CalendarIcon, CloseIcon, FilterListIcon },
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

  // The mode button itself only renders on the non-range input (or the Min
  // side of a range pair) — one mode controls the column as a whole.
  // `reserveModeButtonSpace` is true on BOTH sides of a range so the inputs
  // line up visually even though only Min carries the actual icon button.
  const reserveModeButtonSpace = !!(
    enableColumnFilterModes &&
    columnDef.enableColumnFilterModes !== false &&
    (allowedColumnFilterOptions === undefined || !!allowedColumnFilterOptions?.length)
  );
  const showChangeModeButton = reserveModeButtonSpace && !rangeFilterIndex;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filterValue, setFilterValue] = useState<string | string[]>(() =>
    isMultiSelectFilter
      ? (column.getFilterValue() as string[]) || []
      : isRangeFilter
        ? (column.getFilterValue() as [string, string])?.[rangeFilterIndex as number] || ''
        : ((column.getFilterValue() as string) ?? ''),
  );

  // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: useCallback wraps a debounce() factory so the debounced timer survives renders. Passing an inline function as the rule suggests would re-bind the timer every render and defeat the purpose.
  const handleChangeDebounced = useCallback(
    debounce(
      (newValue: any) => {
        if (isRangeFilter) {
          column.setFilterValue((old: Array<Date | null | number | string>) => {
            const next = [...(old ?? ['', ''])];
            next[rangeFilterIndex as number] = newValue ?? undefined;
            return next;
          });
        } else {
          column.setFilterValue(newValue ?? undefined);
        }
      },
      isTextboxFilter ? (manualFiltering ? 400 : 200) : 1,
    ),
    [],
  );

  // Clear any pending debounced filter update when the cell unmounts so the
  // trailing invocation can't call column.setFilterValue against a stale
  // table instance.
  useEffect(() => () => handleChangeDebounced.cancel(), [handleChangeDebounced]);

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
        const next = [...(Array.isArray(old) ? old : ['', ''])];
        next[rangeFilterIndex as number] = undefined;
        return next;
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
      // oxlint-disable-next-line no-shadow -- intentional re-binding: the outer filterValue is local state; this snapshot reads the latest column value to reconcile against
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: track column.getFilterValue() identity as the sole reconciliation trigger; handleClear/isRangeFilter/rangeFilterIndex/column are stable per cell-lifetime. FOLLOW-UP: extract the call into a `const externalFilterValue = column.getFilterValue();` to satisfy the complex-expression check.
  }, [column.getFilterValue()]);

  if (columnDef.Filter) {
    return <>{columnDef.Filter?.({ column, header, rangeFilterIndex, table })}</>;
  }

  // `date` and `date-range` use a shadcn Popover + Calendar (built below).
  // `datetime`/`time` variants still fall back to native input types — shadcn
  // has no canonical time picker, so the native input remains in v1.
  const isCalendarFilter = filterVariant === 'date' || filterVariant === 'date-range';
  const dateInputType = filterVariant?.startsWith('datetime')
    ? 'datetime-local'
    : filterVariant?.startsWith('time')
      ? 'time'
      : null;

  const helperText = showChangeModeButton ? (
    <p className="text-muted-foreground mt-2 text-xs leading-tight whitespace-nowrap">
      {localization.filterMode.replace(
        '{filterType}',
        localization[
          `filter${
            currentFilterOption?.charAt(0)?.toUpperCase() + currentFilterOption?.slice(1)
          }` as keyof typeof localization
        ] ?? '',
      )}
    </p>
  ) : null;

  // Native datetime/time inputs have their own clear affordance; calendar-based
  // date filters do not, so we render our own clear button for them.
  const isNativeDateFilter = isDateFilter && !isCalendarFilter;
  const showClearButton = !isAutocompleteFilter && !isNativeDateFilter && !filterChipLabel;
  const clearVisible = isCalendarFilter
    ? !!filterValue
    : (typeof filterValue === 'string' || Array.isArray(filterValue) ? filterValue.length : 0) > 0;

  const startAdornment = showChangeModeButton ? (
    <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-1">
      <Button
        aria-label={localization.changeFilterMode}
        onClick={handleFilterMenuOpen}
        size="icon"
        variant="ghost"
        title={localization.changeFilterMode}
        className="pointer-events-auto h-7 w-7"
      >
        <FilterListIcon />
      </Button>
      {filterChipLabel ? (
        <Badge variant="secondary" className="pointer-events-auto ml-1 gap-1 pr-1">
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
  ) : null;

  const endAdornment = showClearButton ? (
    <span
      className={cn(
        'pointer-events-none absolute inset-y-0 z-10 flex items-center',
        isSelectFilter || isMultiSelectFilter ? 'right-6' : 'right-1',
        clearVisible ? 'visible' : 'invisible',
      )}
    >
      <Button
        aria-label={localization.clearFilter}
        disabled={!filterValue?.toString()?.length}
        onClick={handleClear}
        size="icon"
        variant="ghost"
        title={localization.clearFilter}
        className="pointer-events-auto h-7 w-7"
      >
        <CloseIcon className="size-3.5" />
      </Button>
    </span>
  ) : null;

  const wrapperClass = cn(
    'relative flex items-center w-full',
    isDateFilter
      ? 'min-w-[160px]'
      : isRangeFilter
        ? // Both sides of a range pair share the same min-width so Min and Max
          // line up identically — the wider value (110px) accommodates the
          // mode-button-icon space we reserve on both inputs.
          reserveModeButtonSpace
          ? 'min-w-[110px]'
          : 'min-w-[90px]'
        : !filterChipLabel
          ? // Default text/select filter: shrink with the column rather than
            // overflowing it. The column cell clips with `overflow: hidden`, so
            // a hard 120px floor would render the input rounded on the left
            // and cut off on the right whenever the column is narrower. `w-full`
            // above still expands the input to the available column width.
            'min-w-0'
          : 'min-w-fit',
  );

  const inputClass = cn(
    'w-full',
    reserveModeButtonSpace && 'pl-9',
    showClearButton && (isSelectFilter || isMultiSelectFilter ? 'pr-14' : 'pr-9'),
    className,
    textFieldProps?.className,
  );

  const inputRefFn = (inputRef: HTMLInputElement | null) => {
    filterInputRefs.current![`${column.id}-${rangeFilterIndex ?? 0}`] = inputRef!;
    if (typeof textFieldProps.ref === 'function') textFieldProps.ref(inputRef);
  };

  const onSelectChange = (newValue: string) => handleChange(newValue);

  const multiSelectArray = Array.isArray(filterValue) ? filterValue : [];
  const toggleMultiSelectValue = (value: string, checked: boolean) => {
    const next = checked
      ? multiSelectArray.includes(value)
        ? multiSelectArray
        : [...multiSelectArray, value]
      : multiSelectArray.filter((v) => v !== value);
    setFilterValue(next);
    column.setFilterValue(next.length === 0 ? undefined : next);
  };
  const multiSelectTriggerLabel =
    multiSelectArray.length === 0 ? filterPlaceholder : `${multiSelectArray.length} selected`;

  const buttonRefFn = (el: HTMLButtonElement | null) => {
    filterInputRefs.current![`${column.id}-${rangeFilterIndex ?? 0}`] = el as any;
  };

  const filterField = isCalendarFilter ? (
    <div className={wrapperClass}>
      {startAdornment}
      <SST_DateFilter
        ariaLabel={filterPlaceholder}
        calendarIcon={<CalendarIcon className="size-3.5 opacity-60" />}
        className={cn(reserveModeButtonSpace && 'pl-9', showClearButton && 'pr-9', className)}
        disabled={!!filterChipLabel}
        inputRef={buttonRefFn}
        onChange={handleChange}
        placeholder={filterChipLabel ? undefined : filterPlaceholder}
        title={filterPlaceholder}
        value={filterValue as Date | string | undefined}
      />
      {endAdornment}
    </div>
  ) : dateInputType ? (
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
  ) : isMultiSelectFilter ? (
    <div className={wrapperClass}>
      {startAdornment}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRefFn as any}
            type="button"
            variant="outline"
            aria-label={filterPlaceholder}
            title={filterPlaceholder}
            className={cn(
              inputClass,
              'h-9 justify-start font-normal',
              multiSelectArray.length === 0 && 'text-muted-foreground',
            )}
          >
            <span className="truncate">{multiSelectTriggerLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[12rem] p-1"
        >
          <div className="max-h-64 overflow-y-auto">
            {dropdownOptions?.map((option) => {
              const { label, value } = getValueAndLabel(option);
              const checked = multiSelectArray.includes(value);
              const itemId = `${column.id}-multi-${value}`;
              return (
                <div
                  key={value}
                  className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-sm"
                >
                  <Checkbox
                    id={itemId}
                    checked={checked}
                    onCheckedChange={(next) => toggleMultiSelectValue(value, next === true)}
                  />
                  <label htmlFor={itemId} className="flex-1 cursor-pointer truncate">
                    {label}
                  </label>
                  {!columnDef.filterSelectOptions && (
                    <span className="text-muted-foreground text-xs">
                      ({facetedUniqueValues.get(value)})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      {endAdornment}
    </div>
  ) : isSelectFilter ? (
    <div className={wrapperClass}>
      {startAdornment}
      <Select value={(filterValue as string) ?? ''} onValueChange={onSelectChange}>
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
      <SST_FilterOptionMenu
        anchorEl={anchorEl}
        header={header}
        setAnchorEl={setAnchorEl}
        setFilterValue={setFilterValue as (filterValue: any) => void}
        table={table}
      />
    </>
  );
};
