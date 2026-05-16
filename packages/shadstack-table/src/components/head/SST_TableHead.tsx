import * as React from 'react';
import { SST_TableHeadRow } from './SST_TableHeadRow';
import { cn } from '../../lib/utils';
import { type SST_ColumnVirtualizer, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_ToolbarAlertBanner } from '../toolbar/SST_ToolbarAlertBanner';

export interface SST_TableHeadProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'thead'> {
  columnVirtualizer?: SST_ColumnVirtualizer;
  table: SST_TableInstance<TData>;
}

export const SST_TableHead = <TData extends SST_RowData>({
  className,
  columnVirtualizer,
  table,
  ...rest
}: SST_TableHeadProps<TData>) => {
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
            <SST_ToolbarAlertBanner table={table} />
          </th>
        </tr>
      ) : (
        table
          .getHeaderGroups()
          .map((headerGroup) => (
            <SST_TableHeadRow
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
