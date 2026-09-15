import { flexRender } from '../../utils/tanstack.helpers';
import { setElementRef } from '../../utils/refs';
import { composeRefs } from '@radix-ui/react-compose-refs';
import * as React from 'react';
import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useRef, useState } from 'react';
import { useSST_TableState } from '../../hooks/useSST_TableState';
import { Input } from '../../_ui/input';
import { Label } from '../../_ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../_ui/select';
import { cn } from '../../lib/utils';
import { type SST_Cell, type SST_RowData, type SST_TableInstance } from '../../types';
import { getValueAndLabel, parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_EditCellTextFieldProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Input
> {
  cell: SST_Cell<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_EditCellTextField = <TData extends SST_RowData>({
  cell,
  className,
  table,
  ...rest
}: SST_EditCellTextFieldProps<TData>) => {
  const {
    options: { createDisplayMode, editDisplayMode, slotProps },
    refs: { editInputRefs },
    setCreatingRow,
    setEditingCell,
    setEditingRow,
  } = table;

  const { column, row } = cell;
  const { columnDef } = column;

  const { creatingRow, editingRow } = useSST_TableState(table, (s) => ({
    creatingRow: s.creatingRow,
    editingRow: s.editingRow,
  }));

  const { editSelectOptions, editVariant } = columnDef;

  const isCreating = creatingRow?.id === row.id;
  const isEditing = editingRow?.id === row.id;

  const [value, setValue] = useState(
    () => table.getEditedValue(row, column.id) ?? String(cell.getValue() ?? ''),
  );

  const completesCompositionRef = useRef(true);

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
    (isCreating ? createDisplayMode : editDisplayMode) ?? '',
  );

  const saveEditValue = (newValue: string) => {
    table.setEditValue(row, column.id, newValue);

    if (isCreating) {
      setCreatingRow(row);
    } else if (isEditing) {
      setEditingRow(row);
    }
  };

  const updateInputValue = (event: ChangeEvent<HTMLInputElement>) => {
    inputProps.onChange?.(event);
    setValue(event.target.value);
  };

  const commitEditOnBlur = (event: FocusEvent<HTMLInputElement>) => {
    inputProps.onBlur?.(event);
    saveEditValue(value);
    setEditingCell(null);
  };

  const handleEnterKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    inputProps.onKeyDown?.(event);

    if (event.key === 'Enter' && !event.shiftKey && completesCompositionRef.current) {
      editInputRefs.current?.[column.id]?.blur();
    }
  };

  const handleSelectChange = (newValue: string) => {
    setValue(newValue);
    saveEditValue(newValue);
  };

  if (columnDef.Edit) {
    return <>{flexRender(columnDef.Edit, { cell, column, row, table })}</>;
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
              setElementRef(editInputRefs, column.id, node);
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
        ref={composeRefs((node) => {
          setElementRef(editInputRefs, column.id, node);
        }, inputProps.ref)}
        onBlur={commitEditOnBlur}
        onChange={updateInputValue}
        onClick={(e) => {
          e.stopPropagation();
          inputProps?.onClick?.(e);
        }}
        onKeyDown={handleEnterKeyDown}
        onCompositionStart={() => {
          completesCompositionRef.current = false;
        }}
        onCompositionEnd={() => {
          completesCompositionRef.current = true;
        }}
        className={cn(className, inputProps?.className)}
      />
    </div>
  );
};
