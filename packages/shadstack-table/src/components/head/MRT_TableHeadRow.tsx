import * as React from 'react';
import { MRT_TableHeadCell } from './MRT_TableHeadCell';
import { cn } from '../../lib/utils';
import {
  type MRT_ColumnVirtualizer,
  type MRT_Header,
  type MRT_HeaderGroup,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_VirtualItem,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableHeadRowProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'tr'> {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  headerGroup: MRT_HeaderGroup<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadRow = <TData extends MRT_RowData>({
  className,
  columnVirtualizer,
  headerGroup,
  table,
  ...rest
}: MRT_TableHeadRowProps<TData>) => {
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
        let header = headerOrVirtualHeader as MRT_Header<TData>;
        if (columnVirtualizer) {
          staticColumnIndex = (headerOrVirtualHeader as MRT_VirtualItem).index;
          header = headerGroup.headers[staticColumnIndex];
        }

        return header ? (
          <MRT_TableHeadCell
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
