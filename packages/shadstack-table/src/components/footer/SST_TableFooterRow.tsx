import * as React from 'react';
import { SST_TableFooterCell } from './SST_TableFooterCell';
import { cn } from '../../lib/utils';
import {
  type SST_ColumnVirtualizer,
  type SST_Header,
  type SST_HeaderGroup,
  type SST_RowData,
  type SST_TableInstance,
  type SST_VirtualItem,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_TableFooterRowProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'tr'> {
  columnVirtualizer?: SST_ColumnVirtualizer;
  footerGroup: SST_HeaderGroup<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableFooterRow = <TData extends SST_RowData>({
  className,
  columnVirtualizer,
  footerGroup,
  table,
  ...rest
}: SST_TableFooterRowProps<TData>) => {
  const {
    options: {
      layoutMode,
      mrtTheme: { baseBackgroundColor },
      slotProps,
    },
  } = table;

  const { virtualColumns, virtualPaddingLeft, virtualPaddingRight } = columnVirtualizer ?? {};

  if (
    !footerGroup.headers?.some(
      (header) =>
        (typeof header.column.columnDef.footer === 'string' && !!header.column.columnDef.footer) ||
        header.column.columnDef.Footer,
    )
  ) {
    return null;
  }

  const tableRowProps = {
    ...parseFromValuesOrFunc(slotProps?.tableFooterRow, {
      footerGroup,
      table,
    }),
    ...rest,
  };

  const isGrid = !!layoutMode?.startsWith('grid');

  return (
    <tr
      {...tableRowProps}
      style={{
        backgroundColor: baseBackgroundColor,
        width: '100%',
        ...tableRowProps?.style,
      }}
      className={cn('relative', isGrid && 'flex', className, tableRowProps?.className)}
    >
      {virtualPaddingLeft ? <th style={{ display: 'flex', width: virtualPaddingLeft }} /> : null}
      {(virtualColumns ?? footerGroup.headers).map((footerOrVirtualFooter, staticColumnIndex) => {
        let footer = footerOrVirtualFooter as SST_Header<TData>;
        if (columnVirtualizer) {
          staticColumnIndex = (footerOrVirtualFooter as SST_VirtualItem).index;
          footer = footerGroup.headers[staticColumnIndex];
        }

        return footer ? (
          <SST_TableFooterCell
            footer={footer}
            key={footer.id}
            staticColumnIndex={staticColumnIndex}
            table={table}
          />
        ) : null;
      })}
      {virtualPaddingRight ? <th style={{ display: 'flex', width: virtualPaddingRight }} /> : null}
    </tr>
  );
};
