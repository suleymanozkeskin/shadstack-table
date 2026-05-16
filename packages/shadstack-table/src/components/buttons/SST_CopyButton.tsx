import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Cell, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_CopyButtonProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Button
> {
  cell: SST_Cell<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_CopyButton = <TData extends SST_RowData>({
  cell,
  className,
  table,
  ...rest
}: SST_CopyButtonProps<TData>) => {
  const {
    options: { localization, slotProps },
  } = table;
  const { column, row } = cell;
  const { columnDef } = column;

  const [copied, setCopied] = useState(false);

  const handleCopy = (event: MouseEvent, text: unknown) => {
    event.stopPropagation();
    navigator.clipboard.writeText(text as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 4000);
  };

  const buttonProps = {
    ...parseFromValuesOrFunc(slotProps?.copyButton, {
      cell,
      column,
      row,
      table,
    }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.copyButton, {
      cell,
      column,
      row,
      table,
    }),
    ...rest,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={(e) => handleCopy(e, cell.getValue())}
          size="sm"
          type="button"
          variant="ghost"
          {...buttonProps}
          className={cn(
            'h-auto -m-1 min-w-0 px-1 py-0 bg-transparent border-none text-inherit font-[inherit] text-[length:inherit] tracking-[inherit] text-left normal-case cursor-copy hover:bg-transparent',
            className,
            buttonProps?.className,
          )}
          title={undefined}
        />
      </TooltipTrigger>
      <TooltipContent side="top">
        {buttonProps?.title ?? (copied ? localization.copiedToClipboard : localization.clickToCopy)}
      </TooltipContent>
    </Tooltip>
  );
};
