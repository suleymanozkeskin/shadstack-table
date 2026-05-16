import * as React from 'react';
import { MRT_TableHeadRow } from './MRT_TableHeadRow';
import { cn } from '../../lib/utils';
import { type MRT_ColumnVirtualizer, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_ToolbarAlertBanner } from '../toolbar/MRT_ToolbarAlertBanner';

export interface MRT_TableHeadProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'thead'> {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHead = <TData extends MRT_RowData>({
  className,
  columnVirtualizer,
  table,
  ...rest
}: MRT_TableHeadProps<TData>) => {
  const {
    getState,
    options: { enableStickyHeader, layoutMode, positionToolbarAlertBanner, slotProps },
    refs: { tableHeadRef },
  } = table;
  const { isFullScreen, showAlertBanner } = getState();

  const tableHeadProps = {
    ...parseFromValuesOrFunc(slotProps?.tableHead, { table }),
    ...rest,
  };

  const stickyHeader = enableStickyHeader || isFullScreen;
  const isGrid = !!layoutMode?.startsWith('grid');

  return (
    <thead
      {...tableHeadProps}
      ref={(ref: HTMLTableSectionElement | null) => {
        tableHeadRef.current = ref!;
        if (typeof tableHeadProps?.ref === 'function') tableHeadProps.ref(ref!);
      }}
      className={cn(
        'bg-card',
        isGrid && 'grid',
        stickyHeader ? 'sticky top-0 z-10' : 'relative',
        className,
        tableHeadProps?.className,
      )}
    >
      {positionToolbarAlertBanner === 'head-overlay' &&
      (showAlertBanner || table.getSelectedRowModel().rows.length > 0) ? (
        <tr style={{ display: isGrid ? 'grid' : undefined }}>
          <th
            colSpan={table.getVisibleLeafColumns().length}
            style={{ display: isGrid ? 'grid' : undefined, padding: 0 }}
          >
            <MRT_ToolbarAlertBanner table={table} />
          </th>
        </tr>
      ) : (
        table
          .getHeaderGroups()
          .map((headerGroup) => (
            <MRT_TableHeadRow
              columnVirtualizer={columnVirtualizer}
              headerGroup={headerGroup as any}
              key={headerGroup.id}
              table={table}
            />
          ))
      )}
    </thead>
  );
};
