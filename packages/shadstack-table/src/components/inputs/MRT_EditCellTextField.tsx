// oxlint-disable eslint/no-underscore-dangle -- verbatim port of upstream MRT
import * as React from 'react';
import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useState } from 'react';
import { Input } from '../../_ui/input';
import { Label } from '../../_ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../_ui/select';
import { cn } from '../../lib/utils';
import { type MRT_Cell, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getValueAndLabel, parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_EditCellTextFieldProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Input
> {
  cell: MRT_Cell<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_EditCellTextField = <TData extends MRT_RowData>({
  cell,
  className,
  table,
  ...rest
}: MRT_EditCellTextFieldProps<TData>) => {
  const {
    getState,
    options: { createDisplayMode, editDisplayMode, slotProps },
    refs: { editInputRefs },
    setCreatingRow,
    setEditingCell,
    setEditingRow,
  } = table;
  const { column, row } = cell;
  const { columnDef } = column;
  const { creatingRow, editingRow } = getState();
  const { editSelectOptions, editVariant } = columnDef;

  const isCreating = creatingRow?.id === row.id;
  const isEditing = editingRow?.id === row.id;

  const [value, setValue] = useState(() => cell.getValue<string>());
  const [completesComposition, setCompletesComposition] = useState(true);

  const inputProps = {
    ...parseFromValuesOrFunc(slotProps?.editInput, {
      cell,
      column,
      row,
      table,
    }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.editInput, {
      cell,
      column,
      row,
      table,
    }),
    ...rest,
  };

  const selectOptions = parseFromValuesOrFunc(editSelectOptions, {
    cell,
    column,
    row,
    table,
  });

  const isSelectEdit = editVariant === 'select';
  const showLabel = ['custom', 'modal'].includes(
    (isCreating ? createDisplayMode : editDisplayMode) as string,
  );

  const saveInputValueToRowCache = (newValue: string) => {
    //@ts-expect-error
    row._valuesCache[column.id] = newValue;
    if (isCreating) {
      setCreatingRow(row);
    } else if (isEditing) {
      setEditingRow(row);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputProps.onChange?.(event);
    setValue(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    inputProps.onBlur?.(event);
    saveInputValueToRowCache(value);
    setEditingCell(null);
  };

  const handleEnterKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    inputProps.onKeyDown?.(event);
    if (event.key === 'Enter' && !event.shiftKey && completesComposition) {
      editInputRefs.current?.[column.id]?.blur();
    }
  };

  const handleSelectChange = (newValue: string) => {
    setValue(newValue);
    saveInputValueToRowCache(newValue);
  };

  if (columnDef.Edit) {
    return <>{columnDef.Edit?.({ cell, column, row, table })}</>;
  }

  const labelEl = showLabel ? (
    <Label htmlFor={column.id} className="mb-1">
      {columnDef.header}
    </Label>
  ) : null;

  if (isSelectEdit) {
    return (
      <div className="flex flex-col w-full">
        {labelEl}
        <Select value={value ?? ''} onValueChange={handleSelectChange}>
          <SelectTrigger
            className={cn('w-full', className)}
            ref={(node) => {
              if (node) editInputRefs.current![column.id] = node as unknown as HTMLInputElement;
            }}
          >
            <SelectValue placeholder={columnDef.header} />
          </SelectTrigger>
          <SelectContent>
            {selectOptions?.map((option) => {
              const { label, value: optionValue } = getValueAndLabel(option);
              return (
                <SelectItem key={optionValue} value={optionValue}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {labelEl}
      <Input
        autoComplete="off"
        disabled={parseFromValuesOrFunc(columnDef.enableEditing, row) === false}
        id={column.id}
        name={column.id}
        placeholder={!showLabel ? columnDef.header : undefined}
        value={value ?? ''}
        {...inputProps}
        ref={(node) => {
          if (node) {
            editInputRefs.current![column.id] = node;
            if (typeof inputProps.ref === 'function') inputProps.ref(node);
          }
        }}
        onBlur={handleBlur}
        onChange={handleChange}
        onClick={(e) => {
          e.stopPropagation();
          inputProps?.onClick?.(e);
        }}
        onKeyDown={handleEnterKeyDown}
        onCompositionStart={() => setCompletesComposition(false)}
        onCompositionEnd={() => setCompletesComposition(true)}
        className={cn(className, inputProps?.className)}
      />
    </div>
  );
};
