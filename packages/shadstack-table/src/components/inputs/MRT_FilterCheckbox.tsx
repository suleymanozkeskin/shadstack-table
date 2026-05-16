import * as React from 'react';
import { Checkbox } from '../../_ui/checkbox';
import { Label } from '../../_ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Column, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_FilterCheckboxProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Checkbox
> {
  column: MRT_Column<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_FilterCheckbox = <TData extends MRT_RowData>({
  className,
  column,
  table,
  ...rest
}: MRT_FilterCheckboxProps<TData>) => {
  const {
    getState,
    options: { localization, slotProps },
  } = table;
  const { density } = getState();
  const { columnDef } = column;

  const checkboxProps = {
    ...parseFromValuesOrFunc(slotProps?.filterCheckbox, {
      column,
      table,
    }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.filterCheckbox, {
      column,
      table,
    }),
    ...rest,
  };

  const filterLabel = localization.filterByColumn?.replace('{column}', columnDef.header);

  const filterValue = column.getFilterValue();
  const checked: boolean | 'indeterminate' =
    filterValue === undefined ? 'indeterminate' : filterValue === 'true';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Label className="mt-[-4px] text-muted-foreground font-normal cursor-pointer">
          <Checkbox
            checked={checked}
            {...checkboxProps}
            onCheckedChange={(value) => {
              column.setFilterValue(
                column.getFilterValue() === undefined
                  ? 'true'
                  : column.getFilterValue() === 'true'
                    ? 'false'
                    : undefined,
              );
              checkboxProps?.onCheckedChange?.(value);
            }}
            onClick={(e) => {
              e.stopPropagation();
              checkboxProps?.onClick?.(e);
            }}
            className={cn(
              density === 'compact' ? 'h-7 w-7' : 'h-10 w-10',
              className,
              checkboxProps?.className,
            )}
          />
          <span>{checkboxProps.title ?? filterLabel}</span>
        </Label>
      </TooltipTrigger>
      <TooltipContent>{checkboxProps?.title ?? filterLabel}</TooltipContent>
    </Tooltip>
  );
};
