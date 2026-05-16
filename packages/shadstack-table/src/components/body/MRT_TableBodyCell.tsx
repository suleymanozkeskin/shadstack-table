// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import {
  type DragEvent,
  type MouseEvent,
  type RefObject,
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Skeleton } from '../../_ui/skeleton';
import { MRT_TableBodyCellValue } from './MRT_TableBodyCellValue';
import { cn } from '../../lib/utils';
import { type MRT_Cell, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { isCellEditable, cellKeyboardShortcuts, openEditingCell } from '../../utils/cell.utils';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_CopyButton } from '../buttons/MRT_CopyButton';
import { MRT_EditCellTextField } from '../inputs/MRT_EditCellTextField';

export interface MRT_TableBodyCellProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'td'> {
  cell: MRT_Cell<TData>;
  numRows?: number;
  rowRef: RefObject<HTMLTableRowElement | null>;
  staticColumnIndex?: number;
  staticRowIndex: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableBodyCell = <TData extends MRT_RowData>({
  cell,
  className,
  numRows,
  rowRef,
  staticColumnIndex,
  staticRowIndex,
  table,
  ...rest
}: MRT_TableBodyCellProps<TData>) => {
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const {
    getState,
    options: {
      columnResizeDirection,
      columnResizeMode,
      createDisplayMode,
      editDisplayMode,
      enableCellActions,
      enableClickToCopy,
      enableColumnOrdering,
      enableColumnPinning,
      enableGrouping,
      enableKeyboardShortcuts,
      layoutMode,
      mrtTheme: { draggingBorderColor },
      slotProps,
    },
    setHoveredColumn,
  } = table;
  const {
    actionCell,
    columnSizingInfo,
    creatingRow,
    density,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    hoveredColumn,
    hoveredRow,
    isLoading,
    showSkeletons,
  } = getState();
  const { column, row } = cell;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const args = { cell, column, row, table };
  const tableCellProps = {
    ...parseFromValuesOrFunc(slotProps?.tableBodyCell, args),
    ...parseFromValuesOrFunc(columnDef.slotProps?.tableBodyCell, args),
    ...rest,
  };

  const skeletonProps = parseFromValuesOrFunc(slotProps?.skeleton, {
    cell,
    column,
    row,
    table,
  });

  const [skeletonWidth, setSkeletonWidth] = useState(100);
  useEffect(() => {
    if ((!isLoading && !showSkeletons) || skeletonWidth !== 100) return;
    const size = column.getSize();
    setSkeletonWidth(
      columnDefType === 'display'
        ? size / 2
        : Math.round(Math.random() * (size - size / 3) + size / 3),
    );
  }, [isLoading, showSkeletons]);

  const draggingBorders = useMemo(() => {
    const isDraggingColumn = draggingColumn?.id === column.id;
    const isHoveredColumn = hoveredColumn?.id === column.id;
    const isDraggingRow = draggingRow?.id === row.id;
    const isHoveredRow = hoveredRow?.id === row.id;
    const isFirstColumn = column.getIsFirstColumn();
    const isLastColumn = column.getIsLastColumn();
    const isLastRow = numRows && staticRowIndex === numRows - 1;
    const isResizingColumn = columnSizingInfo.isResizingColumn === column.id;
    const showResizeBorder = isResizingColumn && columnResizeMode === 'onChange';

    const borderStyle = showResizeBorder
      ? `2px solid ${draggingBorderColor}`
      : isDraggingColumn || isDraggingRow
        ? `1px dashed color-mix(in oklch, var(--foreground) 50%, transparent)`
        : isHoveredColumn || isHoveredRow || isResizingColumn
          ? `2px dashed ${draggingBorderColor}`
          : undefined;

    if (showResizeBorder) {
      return columnResizeDirection === 'ltr'
        ? { borderRight: borderStyle }
        : { borderLeft: borderStyle };
    }

    return borderStyle
      ? {
          borderBottom:
            isDraggingRow || isHoveredRow || (isLastRow && !isResizingColumn)
              ? borderStyle
              : undefined,
          borderLeft:
            isDraggingColumn ||
            isHoveredColumn ||
            ((isDraggingRow || isHoveredRow) && isFirstColumn)
              ? borderStyle
              : undefined,
          borderRight:
            isDraggingColumn || isHoveredColumn || ((isDraggingRow || isHoveredRow) && isLastColumn)
              ? borderStyle
              : undefined,
          borderTop: isDraggingRow || isHoveredRow ? borderStyle : undefined,
        }
      : undefined;
  }, [
    columnSizingInfo.isResizingColumn,
    draggingColumn,
    draggingRow,
    hoveredColumn,
    hoveredRow,
    staticRowIndex,
  ]);

  const isColumnPinned =
    enableColumnPinning && columnDef.columnDefType !== 'group' && column.getIsPinned();

  const isEditable = isCellEditable({ cell, table });

  const isEditing =
    isEditable &&
    !['custom', 'modal'].includes(editDisplayMode as string) &&
    (editDisplayMode === 'table' || editingRow?.id === row.id || editingCell?.id === cell.id) &&
    !row.getIsGrouped();

  const isCreating = isEditable && createDisplayMode === 'row' && creatingRow?.id === row.id;

  const showClickToCopyButton =
    (parseFromValuesOrFunc(enableClickToCopy, cell) === true ||
      parseFromValuesOrFunc(columnDef.enableClickToCopy, cell) === true) &&
    !['context-menu', false].includes(
      // @ts-expect-error
      parseFromValuesOrFunc(columnDef.enableClickToCopy, cell),
    );

  const isRightClickable = parseFromValuesOrFunc(enableCellActions, cell);

  const cellValueProps = {
    cell,
    table,
    staticColumnIndex,
    staticRowIndex,
  };

  const handleDoubleClick = (event: MouseEvent<HTMLTableCellElement>) => {
    tableCellProps?.onDoubleClick?.(event);
    openEditingCell({ cell, table });
  };

  const handleDragEnter = (e: DragEvent<HTMLTableCellElement>) => {
    tableCellProps?.onDragEnter?.(e);
    if (enableGrouping && hoveredColumn?.id === 'drop-zone') {
      setHoveredColumn(null);
    }
    if (enableColumnOrdering && draggingColumn) {
      setHoveredColumn(columnDef.enableColumnOrdering !== false ? column : null);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (columnDef.enableColumnOrdering !== false) {
      e.preventDefault();
    }
  };

  const handleContextMenu = (e: MouseEvent<HTMLTableCellElement>) => {
    tableCellProps?.onContextMenu?.(e);
    if (isRightClickable) {
      e.preventDefault();
      table.setActionCell(cell);
      table.refs.actionCellRef.current = e.currentTarget;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    tableCellProps?.onKeyDown?.(event);
    cellKeyboardShortcuts({
      cell,
      cellValue: cell.getValue<string>(),
      event,
      table,
    });
  };

  const padding =
    density === 'compact'
      ? columnDefType === 'display'
        ? '0 0.5rem'
        : '0.5rem'
      : density === 'comfortable'
        ? columnDefType === 'display'
          ? '0.5rem 0.75rem'
          : '1rem'
        : columnDefType === 'display'
          ? '1rem 1.25rem'
          : '1.5rem';

  const isGrid = !!layoutMode?.startsWith('grid');

  return (
    <td
      data-index={staticColumnIndex}
      data-pinned={!!isColumnPinned || undefined}
      tabIndex={enableKeyboardShortcuts ? 0 : undefined}
      {...tableCellProps}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      style={{
        textAlign: isRtl ? 'right' : 'left',
        alignItems: isGrid ? 'center' : undefined,
        cursor: isRightClickable
          ? 'context-menu'
          : isEditable && editDisplayMode === 'cell'
            ? 'pointer'
            : 'inherit',
        outline:
          actionCell?.id === cell.id
            ? `1px solid color-mix(in oklch, var(--foreground) 50%, transparent)`
            : undefined,
        padding,
        textOverflow: columnDefType !== 'display' ? 'ellipsis' : undefined,
        whiteSpace: row.getIsPinned() || density === 'compact' ? 'nowrap' : 'normal',
        ...(getCommonMRTCellStyles({
          column,
          table,
          tableCellProps,
        }) as React.CSSProperties),
        ...draggingBorders,
        ...tableCellProps?.style,
      }}
      className={cn('overflow-hidden outline-offset-[-1px]', className, tableCellProps?.className)}
    >
      {tableCellProps.children ?? (
        <>
          {cell.getIsPlaceholder() ? (
            (columnDef.PlaceholderCell?.({ cell, column, row, table }) ?? null)
          ) : showSkeletons !== false && (isLoading || showSkeletons) ? (
            <Skeleton className="h-5" style={{ width: skeletonWidth }} {...skeletonProps} />
          ) : columnDefType === 'display' &&
            (['mrt-row-expand', 'mrt-row-numbers', 'mrt-row-select'].includes(column.id) ||
              !row.getIsGrouped()) ? (
            columnDef.Cell?.({
              cell,
              column,
              renderedCellValue: cell.renderValue() as any,
              row,
              rowRef,
              staticColumnIndex,
              staticRowIndex,
              table,
            })
          ) : isCreating || isEditing ? (
            <MRT_EditCellTextField cell={cell} table={table} />
          ) : showClickToCopyButton && columnDef.enableClickToCopy !== false ? (
            <MRT_CopyButton cell={cell} table={table}>
              <MRT_TableBodyCellValue {...cellValueProps} />
            </MRT_CopyButton>
          ) : (
            <MRT_TableBodyCellValue {...cellValueProps} />
          )}
          {cell.getIsGrouped() && !columnDef.GroupedCell && <> ({row.subRows?.length})</>}
        </>
      )}
    </td>
  );
};

export const Memo_MRT_TableBodyCell = memo(
  MRT_TableBodyCell,
  (prev, next) => next.cell === prev.cell,
) as typeof MRT_TableBodyCell;
