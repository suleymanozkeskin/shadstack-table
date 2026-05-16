import * as React from 'react';
import { SST_TableHeadCell } from './SST_TableHeadCell';
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

export interface SST_TableHeadRowProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'tr'> {
  columnVirtualizer?: SST_ColumnVirtualizer;
  headerGroup: SST_HeaderGroup<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableHeadRow = <TData extends SST_RowData>({
  className,
  columnVirtualizer,
  headerGroup,
  table,
  ...rest
}: SST_TableHeadRowProps<TData>) => {
  const {
    options: {
      enableStickyHeader,
      layoutMode,
      mrtTheme: { baseBackgroundColor },
      slotProps,
    },
  } = table;

  const { virtualColumns, virtualPaddingLeft, virtualPaddingRight } = columnVirtualizer ?? {};

  const tableRowProps = {
    ...parseFromValuesOrFunc(slotProps?.tableHeadRow, {
      headerGroup,
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
        boxShadow: '4px 0 8px color-mix(in oklch, var(--foreground) 10%, transparent)',
        top: 0,
        ...tableRowProps?.style,
      }}
      className={cn(
        isGrid && 'flex',
        enableStickyHeader && layoutMode === 'semantic' ? 'sticky' : 'relative',
        className,
        tableRowProps?.className,
      )}
    >
      {virtualPaddingLeft ? <th style={{ display: 'flex', width: virtualPaddingLeft }} /> : null}
      {(virtualColumns ?? headerGroup.headers).map((headerOrVirtualHeader, staticColumnIndex) => {
        let header = headerOrVirtualHeader as SST_Header<TData>;
        if (columnVirtualizer) {
          staticColumnIndex = (headerOrVirtualHeader as SST_VirtualItem).index;
          header = headerGroup.headers[staticColumnIndex];
        }

        return header ? (
          <SST_TableHeadCell
            columnVirtualizer={columnVirtualizer}
            header={header}
            key={header.id}
            staticColumnIndex={staticColumnIndex}
            table={table}
          />
        ) : null;
      })}
      {virtualPaddingRight ? <th style={{ display: 'flex', width: virtualPaddingRight }} /> : null}
    </tr>
  );
};
