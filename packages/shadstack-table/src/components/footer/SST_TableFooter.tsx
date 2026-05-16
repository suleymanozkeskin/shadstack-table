import * as React from 'react';
import { SST_TableFooterRow } from './SST_TableFooterRow';
import { cn } from '../../lib/utils';
import { type SST_ColumnVirtualizer, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_TableFooterProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'tfoot'> {
  columnVirtualizer?: SST_ColumnVirtualizer;
  table: SST_TableInstance<TData>;
}

export const SST_TableFooter = <TData extends SST_RowData>({
  className,
  columnVirtualizer,
  table,
  ...rest
}: SST_TableFooterProps<TData>) => {
  const {
    getState,
    options: { enableStickyFooter, layoutMode, slotProps },
    refs: { tableFooterRef },
  } = table;
  const { isFullScreen } = getState();

  const tableFooterProps = {
    ...parseFromValuesOrFunc(slotProps?.tableFooter, {
      table,
    }),
    ...rest,
  };

  const stickFooter = (isFullScreen || enableStickyFooter) && enableStickyFooter !== false;

  const footerGroups = table.getFooterGroups();

  if (
    !footerGroups.some((footerGroup) =>
      footerGroup.headers?.some(
        (header) =>
          (typeof header.column.columnDef.footer === 'string' &&
            !!header.column.columnDef.footer) ||
          header.column.columnDef.Footer,
      ),
    )
  ) {
    return null;
  }

  const isGrid = !!layoutMode?.startsWith('grid');

  return (
    <tfoot
      {...tableFooterProps}
      ref={(ref: HTMLTableSectionElement | null) => {
        tableFooterRef.current = ref!;
        if (typeof tableFooterProps?.ref === 'function') tableFooterProps.ref(ref!);
      }}
      style={{
        bottom: stickFooter ? 0 : undefined,
        opacity: stickFooter ? 0.97 : undefined,
        outline: stickFooter ? '1px solid var(--border)' : undefined,
        ...tableFooterProps?.style,
      }}
      className={cn(
        isGrid && 'grid',
        stickFooter ? 'sticky z-[1]' : 'relative',
        className,
        tableFooterProps?.className,
      )}
    >
      {footerGroups.map((footerGroup) => (
        <SST_TableFooterRow
          columnVirtualizer={columnVirtualizer}
          footerGroup={footerGroup as any}
          key={footerGroup.id}
          table={table}
        />
      ))}
    </tfoot>
  );
};
