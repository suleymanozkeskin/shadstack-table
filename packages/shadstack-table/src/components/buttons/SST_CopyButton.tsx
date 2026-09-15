import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Cell, type SST_RowData, type SST_TableInstance } from '../../types';
import { copyToClipboard } from '../../utils/clipboard.utils';
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

  const handleCopy = async (event: MouseEvent) => {
    event.stopPropagation();

    const ok = await copyToClipboard(table, {
      value: String(cell.getValue() ?? ''),
      cell,
      source: 'button',
    });

    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }
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
          onClick={(e) => handleCopy(e)}
          size="sm"
          purpose="copy"
          type="button"
          variant="ghost"
          {...buttonProps}
          className={cn('-m-1', className, buttonProps?.className)}
          title={undefined}
        />
      </TooltipTrigger>
      <TooltipContent side="top">
        {buttonProps?.title ?? (copied ? localization.copiedToClipboard : localization.clickToCopy)}
      </TooltipContent>
    </Tooltip>
  );
};
