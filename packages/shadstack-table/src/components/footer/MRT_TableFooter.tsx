import * as React from 'react';
import { MRT_TableFooterRow } from './MRT_TableFooterRow';
import { cn } from '../../lib/utils';
import { type MRT_ColumnVirtualizer, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableFooterProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'tfoot'> {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableFooter = <TData extends MRT_RowData>({
  className,
  columnVirtualizer,
  table,
  ...rest
}: MRT_TableFooterProps<TData>) => {
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
        <MRT_TableFooterRow
          columnVirtualizer={columnVirtualizer}
          footerGroup={footerGroup as any}
          key={footerGroup.id}
          table={table}
        />
      ))}
    </tfoot>
  );
};
