import * as React from 'react';
import { cn } from '../../lib/utils';
import { type MRT_Header, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { cellKeyboardShortcuts } from '../../utils/cell.utils';

export interface MRT_TableFooterCellProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'td'> {
  footer: MRT_Header<TData>;
  staticColumnIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableFooterCell = <TData extends MRT_RowData>({
  className,
  footer,
  staticColumnIndex,
  table,
  ...rest
}: MRT_TableFooterCellProps<TData>) => {
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const {
    getState,
    options: { enableColumnPinning, enableKeyboardShortcuts, slotProps },
  } = table;
  const { density } = getState();
  const { column } = footer;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const isColumnPinned =
    enableColumnPinning && columnDef.columnDefType !== 'group' && column.getIsPinned();

  const args = { column, table };
  const tableCellProps = {
    ...parseFromValuesOrFunc(slotProps?.tableFooterCell, args),
    ...parseFromValuesOrFunc(columnDef.slotProps?.tableFooterCell, args),
    ...rest,
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    tableCellProps?.onKeyDown?.(event);
    cellKeyboardShortcuts({
      event,
      cellValue: footer.column.columnDef.footer,
      table,
    });
  };

  const padding = density === 'compact' ? '0.5rem' : density === 'comfortable' ? '1rem' : '1.5rem';

  const align = columnDefType === 'group' ? 'center' : isRtl ? 'right' : 'left';

  return (
    <td
      colSpan={footer.colSpan}
      data-index={staticColumnIndex}
      data-pinned={!!isColumnPinned || undefined}
      tabIndex={enableKeyboardShortcuts ? 0 : undefined}
      {...tableCellProps}
      onKeyDown={handleKeyDown}
      style={{
        textAlign: align,
        fontWeight: 'bold',
        padding,
        verticalAlign: 'top',
        ...(getCommonMRTCellStyles({
          column,
          header: footer,
          table,
          tableCellProps,
        }) as React.CSSProperties),
        ...tableCellProps?.style,
      }}
      className={cn(className, tableCellProps?.className)}
    >
      {tableCellProps.children ??
        (footer.isPlaceholder
          ? null
          : (parseFromValuesOrFunc(columnDef.Footer, {
              column,
              footer,
              table,
            }) ??
            columnDef.footer ??
            null))}
    </td>
  );
};
