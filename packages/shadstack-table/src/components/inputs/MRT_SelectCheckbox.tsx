import * as React from 'react';
import { Checkbox } from '../../_ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../_ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';
import {
  getIsRowSelected,
  getMRT_RowSelectionHandler,
  getMRT_SelectAllHandler,
} from '../../utils/row.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_SelectCheckboxProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Checkbox
> {
  row?: MRT_Row<TData>;
  staticRowIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_SelectCheckbox = <TData extends MRT_RowData>({
  className,
  row,
  staticRowIndex,
  table,
  ...rest
}: MRT_SelectCheckboxProps<TData>) => {
  const {
    getState,
    options: { enableMultiRowSelection, localization, selectAllMode, slotProps },
  } = table;
  const { density, isLoading } = getState();

  const selectAll = !row;

  const allRowsSelected = selectAll
    ? selectAllMode === 'page'
      ? table.getIsAllPageRowsSelected()
      : table.getIsAllRowsSelected()
    : undefined;

  const isChecked = selectAll ? allRowsSelected : getIsRowSelected({ row, table });

  const checkboxProps = {
    ...(selectAll
      ? parseFromValuesOrFunc(slotProps?.selectAllCheckbox, { table })
      : parseFromValuesOrFunc(slotProps?.selectCheckbox, {
          row,
          staticRowIndex,
          table,
        })),
    ...rest,
  };

  const onSelectionChange = row
    ? getMRT_RowSelectionHandler({
        row,
        staticRowIndex,
        table,
      })
    : undefined;

  const onSelectAllChange = getMRT_SelectAllHandler({ table });

  const ariaLabel = selectAll ? localization.toggleSelectAll : localization.toggleSelectRow;
  const tooltipTitle = checkboxProps?.title ?? ariaLabel;
  const disabled = isLoading || (row && !row.getCanSelect()) || row?.id === 'mrt-row-create';

  const handleChange = (event: any) => {
    event.stopPropagation();
    if (selectAll) {
      onSelectAllChange(event);
    } else {
      onSelectionChange!(event);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    checkboxProps?.onClick?.(e);
  };

  const sizeClasses = density === 'compact' ? 'h-7 w-7' : 'h-10 w-10';
  const marginClass = density !== 'compact' ? '-m-1.5' : undefined;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex items-center justify-center', sizeClasses, marginClass)}>
          {enableMultiRowSelection === false ? (
            <RadioGroup
              value={isChecked ? 'on' : ''}
              onValueChange={() =>
                handleChange({ target: { checked: !isChecked }, stopPropagation: () => {} })
              }
            >
              <RadioGroupItem
                aria-label={ariaLabel}
                disabled={disabled}
                value="on"
                onClick={handleClick}
                className={cn(className, checkboxProps?.className)}
              />
            </RadioGroup>
          ) : (
            <Checkbox
              aria-label={ariaLabel}
              checked={
                !isChecked && selectAll
                  ? table.getIsSomeRowsSelected()
                    ? 'indeterminate'
                    : false
                  : row?.getIsSomeSelected() && row.getCanSelectSubRows()
                    ? 'indeterminate'
                    : !!isChecked
              }
              disabled={disabled}
              onCheckedChange={(_value) =>
                handleChange({
                  target: { checked: !isChecked },
                  stopPropagation: () => {},
                })
              }
              onClick={handleClick}
              {...checkboxProps}
              className={cn(className, checkboxProps?.className)}
            />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltipTitle}</TooltipContent>
    </Tooltip>
  );
};
