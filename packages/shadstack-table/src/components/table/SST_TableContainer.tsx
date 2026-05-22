import * as React from 'react';
import { useEffect, useState } from 'react';
import { SST_Table } from './SST_Table';
import { SST_TableLoadingOverlay } from './SST_TableLoadingOverlay';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_CellActionMenu } from '../menus/SST_CellActionMenu';
import { SST_EditRowModal } from '../modals/SST_EditRowModal';

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
      id,
      mrtTheme: { cellNavigationOutlineColor },
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

  // Toolbar height drives `maxHeight` for full-screen + sticky-header layouts.
  // Use a single ResizeObserver per container instead of measuring on every
  // render: the previous depless layout effect ran on every re-render even when
  // toolbar size hadn't changed. We measure once on mount and then let the
  // observer fire only when one of the toolbars actually resizes (responsive
  // breakpoints, dynamic chips, font load, etc.). `setTotalToolbarHeight` only
  // commits when the summed value changes, so observer noise doesn't bump
  // React state.
  useEffect(() => {
    const measure = () => {
      const top = topToolbarRef.current?.offsetHeight ?? 0;
      const bottom = bottomToolbarRef?.current?.offsetHeight ?? 0;
      const next = top + bottom;
      setTotalToolbarHeight((prev) => (prev === next ? prev : next));
    };

    measure();

    // SSR / older browsers without ResizeObserver — fall back to the one-time
    // mount measurement above; the toolbar geometry is rarely dynamic in
    // those environments.
    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(measure);
    if (topToolbarRef.current) ro.observe(topToolbarRef.current);
    if (bottomToolbarRef?.current) ro.observe(bottomToolbarRef.current);

    return () => ro.disconnect();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: refs are stable across renders and the observer reacts to dynamic content size; depending on the ref objects themselves would not change observer behavior.
  }, []);

  const createModalOpen = createDisplayMode === 'modal' && creatingRow;
  const editModalOpen = editDisplayMode === 'modal' && editingRow;

  return (
    <div
      aria-busy={loading}
      aria-describedby={loading ? `sst-progress-${id}` : undefined}
      data-slot="sst-table-container"
      {...tableContainerProps}
      ref={(node: HTMLDivElement | null) => {
        if (node) {
          tableContainerRef.current = node;
          if (typeof tableContainerProps?.ref === 'function') tableContainerProps.ref(node);
        }
      }}
      style={{
        // Themable focus ring color for keyboard-navigated cells; consumed by
        // the `[data-slot='sst-table-container'] :focus-visible` rule in
        // _ui/styles.css. Cells used to set this via a nested selector inside
        // inline style, which React warns about and silently drops.
        ['--sst-cell-outline-color' as string]: cellNavigationOutlineColor,
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
