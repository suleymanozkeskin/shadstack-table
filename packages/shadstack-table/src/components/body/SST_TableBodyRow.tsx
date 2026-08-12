import * as React from 'react';
import { type DragEvent, memo, useMemo, useRef } from 'react';
import { type VirtualItem } from '@tanstack/react-virtual';
import { useSST_TableState } from '../../hooks/useSST_TableState';
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
  numRows?: number;
  pinnedRowIds?: string[];
  row: SST_Row<TData>;
  rowVirtualizer?: SST_RowVirtualizer;
  staticRowIndex: number;
  table: SST_TableInstance<TData>;
  virtualRow?: VirtualItem;
}

export const SST_TableBodyRow = <TData extends SST_RowData>({
  className,
  columnVirtualizer,
  numRows,
  pinnedRowIds,
  row,
  rowVirtualizer,
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
  //Per-row projections: this row re-renders only when a value that affects
  //THIS row changes — hovering or dragging over row A no longer re-renders
  //row B. The projections read row APIs (selection/pinning), so the
  //subscription covers those slices too.
  const {
    density,
    editingCellId,
    isDraggingColumnActive,
    isDraggingRowActive,
    isDraggingThisRow,
    isEditingThisRow,
    isFullScreen,
    isHoveredThisRow,
    isRowPinned,
    isRowSelected,
  } = useSST_TableState(table, (s) => ({
    density: s.density,
    //only the memoMode==='cells' gate reads these; keeping them out of the
    //projection otherwise means editing one cell re-renders one cell, not
    //every row
    editingCellId: memoMode === 'cells' ? (s.editingCell?.id ?? null) : null,
    isDraggingColumnActive: !!s.draggingColumn,
    isDraggingRowActive: !!s.draggingRow,
    isDraggingThisRow: s.draggingRow?.id === row.id,
    isEditingThisRow: memoMode === 'cells' ? s.editingRow?.id === row.id : false,
    isFullScreen: s.isFullScreen,
    isHoveredThisRow: s.hoveredRow?.id === row.id,
    isRowPinned: !!(enableRowPinning && row.getIsPinned()),
    isRowSelected: getIsRowSelected({ row, table }),
  }));

  const visibleCells = row.getVisibleCells();

  const { virtualColumns, virtualPaddingLeft, virtualPaddingRight } = columnVirtualizer ?? {};

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
    if (enableRowOrdering && isDraggingRowActive) {
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
          opacity: isRowPinned ? 0.97 : isDraggingThisRow || isHoveredThisRow ? 0.5 : 1,
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
          const props = {
            cell,
            numRows,
            rowRef,
            staticColumnIndex,
            staticRowIndex,
            table,
          };
          const key = `${cell.id}-${staticRowIndex}`;
          return cell ? (
            memoMode === 'cells' &&
            cell.column.columnDef.columnDefType === 'data' &&
            !isDraggingColumnActive &&
            !isDraggingRowActive &&
            editingCellId !== cell.id &&
            !isEditingThisRow ? (
              <Memo_SST_TableBodyCell key={key} {...props} />
            ) : (
              <SST_TableBodyCell key={key} {...props} />
            )
          ) : null;
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

export const Memo_SST_TableBodyRow = memo(
  SST_TableBodyRow,
  (prev, next) => prev.row === next.row && prev.staticRowIndex === next.staticRowIndex,
) as typeof SST_TableBodyRow;
