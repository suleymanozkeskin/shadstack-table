import * as React from 'react';
import { type DragEvent, memo, useMemo, useRef } from 'react';
import { type VirtualItem } from '@tanstack/react-virtual';
import { SST_TableBodyCell, Memo_SST_TableBodyCell } from './SST_TableBodyCell';
import { SST_TableDetailPanel } from './SST_TableDetailPanel';
import { cn } from '../../lib/utils';
import {
  type SST_Cell,
  type SST_ColumnVirtualizer,
  type SST_Row,
  type SST_RowData,
  type SST_RowVirtualizer,
  type SST_TableInstance,
  type SST_VirtualItem,
} from '../../types';
import { getIsRowSelected } from '../../utils/row.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_TableBodyRowProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'tr'> {
  columnVirtualizer?: SST_ColumnVirtualizer;
  /**
   * Render-state primitives lifted from `table.getState()` at the body level
   * (see SST_TableBody). The row forwards the cell-relevant ones to each
   * `<SST_TableBodyCell>` after narrowing them per-cell, so the row tree
   * itself contains zero render-time `getState()` calls — the body is the
   * single point that resolves table state into props.
   */
  actionCellId: string | null;
  density: 'compact' | 'comfortable' | 'spacious';
  draggingColumnId: string | null;
  /** id of the editing cell, if that cell belongs to this row — else null */
  editingCellIdInRow: string | null;
  hoveredColumnId: string | null;
  isCreatingRow: boolean;
  isDraggingRow: boolean;
  isEditingRow: boolean;
  isFullScreen: boolean;
  isHoveredRow: boolean;
  isLoading: boolean;
  isRtl: boolean;
  /** id of the resizing column, or false if none */
  resizingColumnId: string | false;
  showSkeletons: boolean;
  numRows?: number;
  pinnedRowIds?: string[];
  row: SST_Row<TData>;
  rowVirtualizer?: SST_RowVirtualizer;
  staticRowIndex: number;
  table: SST_TableInstance<TData>;
  virtualRow?: VirtualItem;
}

export const SST_TableBodyRow = <TData extends SST_RowData>({
  actionCellId,
  className,
  columnVirtualizer,
  density,
  draggingColumnId,
  editingCellIdInRow,
  hoveredColumnId,
  isCreatingRow,
  isDraggingRow,
  isEditingRow,
  isFullScreen,
  isHoveredRow,
  isLoading,
  isRtl,
  numRows,
  pinnedRowIds,
  resizingColumnId,
  row,
  rowVirtualizer,
  showSkeletons,
  staticRowIndex,
  table,
  virtualRow,
  ...rest
}: SST_TableBodyRowProps<TData>) => {
  const {
    options: {
      enableRowOrdering,
      enableRowPinning,
      enableStickyFooter,
      enableStickyHeader,
      layoutMode,
      memoMode,
      mrtTheme: { baseBackgroundColor, pinnedRowBackgroundColor, selectedRowBackgroundColor },
      renderDetailPanel,
      rowPinningDisplayMode,
      slotProps,
    },
    refs: { tableFooterRef, tableHeadRef },
    setHoveredRow,
  } = table;

  const visibleCells = row.getVisibleCells();

  const { virtualColumns, virtualPaddingLeft, virtualPaddingRight } = columnVirtualizer ?? {};

  const isRowSelected = getIsRowSelected({ row, table });
  const isRowPinned = enableRowPinning && row.getIsPinned();

  const tableRowProps = {
    ...parseFromValuesOrFunc(slotProps?.tableBodyRow, {
      row,
      staticRowIndex,
      table,
    }),
    ...rest,
  };

  const [bottomPinnedIndex, topPinnedIndex] = useMemo(() => {
    if (
      !enableRowPinning ||
      !rowPinningDisplayMode?.includes('sticky') ||
      !pinnedRowIds ||
      !row.getIsPinned()
    )
      return [];
    return [[...pinnedRowIds].reverse().indexOf(row.id), pinnedRowIds.indexOf(row.id)];
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- enableRowPinning / rowPinningDisplayMode are per-instance options that don't change at runtime; row is intentionally read by id only when pinnedRowIds identity changes.
  }, [pinnedRowIds]);

  const tableHeadHeight =
    ((enableStickyHeader || isFullScreen) && tableHeadRef.current?.clientHeight) || 0;
  const tableFooterHeight = (enableStickyFooter && tableFooterRef.current?.clientHeight) || 0;

  const defaultRowHeight = density === 'compact' ? 37 : density === 'comfortable' ? 53 : 69;

  const customRowHeight = parseInt((tableRowProps?.style as any)?.height ?? '', 10) || undefined;

  const rowHeight = customRowHeight || defaultRowHeight;

  const handleDragEnter = (_e: DragEvent) => {
    if (enableRowOrdering && table.getState().draggingRow) {
      setHoveredRow(row);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const rowRef = useRef<HTMLTableRowElement | null>(null);

  const cellHighlightColor = isRowSelected
    ? selectedRowBackgroundColor
    : isRowPinned
      ? pinnedRowBackgroundColor
      : undefined;

  const isGrid = !!layoutMode?.startsWith('grid');

  return (
    <>
      <tr
        data-index={renderDetailPanel ? staticRowIndex * 2 : staticRowIndex}
        data-pinned={!!isRowPinned || undefined}
        data-selected={isRowSelected || undefined}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        ref={(node: HTMLTableRowElement | null) => {
          if (node) {
            rowRef.current = node;
            rowVirtualizer?.measureElement(node);
          }
        }}
        {...tableRowProps}
        style={{
          backgroundColor: cellHighlightColor ?? baseBackgroundColor,
          bottom:
            !virtualRow && bottomPinnedIndex !== undefined && isRowPinned
              ? `${
                  bottomPinnedIndex * rowHeight + (enableStickyFooter ? tableFooterHeight - 1 : 0)
                }px`
              : undefined,
          opacity: isRowPinned ? 0.97 : isDraggingRow || isHoveredRow ? 0.5 : 1,
          top: virtualRow
            ? 0
            : topPinnedIndex !== undefined && isRowPinned
              ? `${
                  topPinnedIndex * rowHeight +
                  (enableStickyHeader || isFullScreen ? tableHeadHeight - 1 : 0)
                }px`
              : undefined,
          transition: virtualRow ? 'none' : 'all 150ms ease-in-out',
          zIndex: rowPinningDisplayMode?.includes('sticky') && isRowPinned ? 2 : 0,
          transform: virtualRow ? `translateY(${virtualRow.start}px)` : undefined,
          ...tableRowProps?.style,
        }}
        className={cn(
          'box-border w-full border-b transition-colors hover:bg-muted/50 data-[selected]:bg-muted',
          isGrid && 'flex',
          virtualRow
            ? 'absolute'
            : rowPinningDisplayMode?.includes('sticky') && isRowPinned
              ? 'sticky'
              : 'relative',
          className,
          tableRowProps?.className,
        )}
      >
        {virtualPaddingLeft ? <td style={{ display: 'flex', width: virtualPaddingLeft }} /> : null}
        {(virtualColumns ?? visibleCells).map((cellOrVirtualCell, staticColumnIndex) => {
          let cell = cellOrVirtualCell as SST_Cell<TData>;
          if (columnVirtualizer) {
            staticColumnIndex = (cellOrVirtualCell as SST_VirtualItem).index;
            cell = visibleCells[staticColumnIndex];
          }
          if (!cell) return null;
          // Narrow the row-level state primitives down to this specific cell.
          // These comparisons used to live inside SST_TableBodyCell's render,
          // which forced every cell to re-render on any state change. Doing
          // them here once means cells whose narrow primitives don't change
          // can bail via Memo_SST_TableBodyCell's shallow-equal comparator.
          const columnId = cell.column.id;
          const isDraggingColumn = draggingColumnId === columnId;
          const isHoveredColumn = hoveredColumnId === columnId;
          const isResizingThisColumn = resizingColumnId === columnId;
          const isEditingCell = editingCellIdInRow === cell.id;
          const isActionCell = actionCellId === cell.id;

          const props = {
            cell,
            density,
            isActionCell,
            isCreatingRow,
            isDraggingColumn,
            isDraggingRow,
            isEditingCell,
            isEditingRow,
            isHoveredColumn,
            isHoveredRow,
            isLoading,
            isResizingThisColumn,
            isRtl,
            numRows,
            rowRef,
            showSkeletons,
            staticColumnIndex,
            staticRowIndex,
            table,
          };
          const key = `${cell.id}-${staticRowIndex}`;
          // Memo gate is now safe to enable on every data cell — the
          // comparator covers drag/edit/hover via the primitive props above,
          // so we no longer need to fall back to the unmemoed component when
          // those modes are active.
          return memoMode === 'cells' && cell.column.columnDef.columnDefType === 'data' ? (
            <Memo_SST_TableBodyCell key={key} {...props} />
          ) : (
            <SST_TableBodyCell key={key} {...props} />
          );
        })}
        {virtualPaddingRight ? (
          <td style={{ display: 'flex', width: virtualPaddingRight }} />
        ) : null}
      </tr>
      {renderDetailPanel && !row.getIsGrouped() && (
        <SST_TableDetailPanel
          parentRowRef={rowRef}
          row={row}
          rowVirtualizer={rowVirtualizer}
          staticRowIndex={staticRowIndex}
          table={table}
          virtualRow={virtualRow}
        />
      )}
    </>
  );
};

// The old comparator only checked `row` + `staticRowIndex`. That meant rows
// memoed on those two refs but ignored hover/drag/edit/density state — those
// signals used to be read off `getState()` inside the row itself, hidden
// from the memo's view. Now they're discrete primitive props passed from
// SST_TableBody, so a shallow-equal of the render-relevant props is the
// correct gate: irrelevant rows truly bail, the one row that needs to
// update gets a different prop and re-renders.
export const Memo_SST_TableBodyRow = memo(SST_TableBodyRow, (prev, next) => {
  return (
    prev.row === next.row &&
    prev.staticRowIndex === next.staticRowIndex &&
    prev.actionCellId === next.actionCellId &&
    prev.columnVirtualizer === next.columnVirtualizer &&
    prev.density === next.density &&
    prev.draggingColumnId === next.draggingColumnId &&
    prev.editingCellIdInRow === next.editingCellIdInRow &&
    prev.hoveredColumnId === next.hoveredColumnId &&
    prev.isCreatingRow === next.isCreatingRow &&
    prev.isDraggingRow === next.isDraggingRow &&
    prev.isEditingRow === next.isEditingRow &&
    prev.isFullScreen === next.isFullScreen &&
    prev.isHoveredRow === next.isHoveredRow &&
    prev.isLoading === next.isLoading &&
    prev.isRtl === next.isRtl &&
    prev.numRows === next.numRows &&
    prev.pinnedRowIds === next.pinnedRowIds &&
    prev.resizingColumnId === next.resizingColumnId &&
    prev.rowVirtualizer === next.rowVirtualizer &&
    prev.showSkeletons === next.showSkeletons &&
    prev.virtualRow === next.virtualRow
  );
}) as typeof SST_TableBodyRow;
