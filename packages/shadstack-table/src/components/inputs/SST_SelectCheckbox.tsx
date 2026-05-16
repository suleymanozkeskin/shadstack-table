import * as React from 'react';
import { Checkbox } from '../../_ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../_ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Row, type SST_RowData, type SST_TableInstance } from '../../types';
import {
  getIsRowSelected,
  getSST_RowSelectionHandler,
  getSST_SelectAllHandler,
} from '../../utils/row.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_SelectCheckboxProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Checkbox
> {
  row?: SST_Row<TData>;
  staticRowIndex?: number;
  table: SST_TableInstance<TData>;
}

export const SST_SelectCheckbox = <TData extends SST_RowData>({
  className,
  row,
  staticRowIndex,
  table,
  ...rest
}: SST_SelectCheckboxProps<TData>) => {
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
    ? getSST_RowSelectionHandler({
        row,
        staticRowIndex,
        table,
      })
    : undefined;

  const onSelectAllChange = getSST_SelectAllHandler({ table });

  const ariaLabel = selectAll ? localization.toggleSelectAll : localization.toggleSelectRow;
  const tooltipTitle = checkboxProps?.title ?? ariaLabel;
  const disabled = isLoading || (row && !row.getCanSelect()) || row?.id === 'sst-row-create';

  const handleChange = (event: any) => {
    event.stopPropagation();
    if (selectAll) {
      onSelectAllChange(event);
    } else {
      onSelectionChange!(event);
    }
  };

  const forwardCheckboxClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    checkboxProps?.onClick?.(e);
  };

  const sizeClasses = density === 'compact' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex shrink-0 items-center justify-center', sizeClasses)}>
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
                onClick={forwardCheckboxClick}
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
              onClick={forwardCheckboxClick}
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
