import * as React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { SST_Table } from './SST_Table';
import { SST_TableLoadingOverlay } from './SST_TableLoadingOverlay';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_CellActionMenu } from '../menus/SST_CellActionMenu';
import { SST_EditRowModal } from '../modals/SST_EditRowModal';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface SST_TableContainerProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  table: SST_TableInstance<TData>;
}

export const SST_TableContainer = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_TableContainerProps<TData>) => {
  const {
    getState,
    options: {
      createDisplayMode,
      editDisplayMode,
      enableCellActions,
      enableStickyHeader,
      slotProps,
    },
    refs: { bottomToolbarRef, tableContainerRef, topToolbarRef },
  } = table;
  const { actionCell, creatingRow, editingRow, isFullScreen, isLoading, showLoadingOverlay } =
    getState();

  const loading = showLoadingOverlay !== false && (isLoading || showLoadingOverlay);

  const [totalToolbarHeight, setTotalToolbarHeight] = useState(0);

  const tableContainerProps = {
    ...parseFromValuesOrFunc(slotProps?.tableContainer, {
      table,
    }),
    ...rest,
  };

  useIsomorphicLayoutEffect(() => {
    const topToolbarHeight =
      typeof document !== 'undefined' ? (topToolbarRef.current?.offsetHeight ?? 0) : 0;

    const bottomToolbarHeight =
      typeof document !== 'undefined' ? (bottomToolbarRef?.current?.offsetHeight ?? 0) : 0;

    setTotalToolbarHeight(topToolbarHeight + bottomToolbarHeight);
  });

  const createModalOpen = createDisplayMode === 'modal' && creatingRow;
  const editModalOpen = editDisplayMode === 'modal' && editingRow;

  return (
    <div
      aria-busy={loading}
      aria-describedby={loading ? 'mrt-progress' : undefined}
      data-slot="mrt-table-container"
      {...tableContainerProps}
      ref={(node: HTMLDivElement | null) => {
        if (node) {
          tableContainerRef.current = node;
          if (typeof tableContainerProps?.ref === 'function') tableContainerProps.ref(node);
        }
      }}
      style={{
        maxHeight: isFullScreen
          ? `calc(100vh - ${totalToolbarHeight}px)`
          : enableStickyHeader
            ? `clamp(350px, calc(100vh - ${totalToolbarHeight}px), 9999px)`
            : undefined,
        ...tableContainerProps?.style,
      }}
      className={cn(
        'w-full max-w-full min-w-0 overflow-x-auto overflow-y-auto relative isolate',
        className,
        tableContainerProps?.className,
      )}
    >
      {loading ? <SST_TableLoadingOverlay table={table} /> : null}
      <SST_Table table={table} />
      {(createModalOpen || editModalOpen) && <SST_EditRowModal open table={table} />}
      {enableCellActions && actionCell && <SST_CellActionMenu table={table} />}
    </div>
  );
};
