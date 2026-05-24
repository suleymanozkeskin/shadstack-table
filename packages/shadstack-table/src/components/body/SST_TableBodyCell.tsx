import * as React from 'react';
import {
  type DragEvent,
  type MouseEvent,
  type RefObject,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Skeleton } from '../../_ui/skeleton';
import { SST_TableBodyCellValue } from './SST_TableBodyCellValue';
import { cn } from '../../lib/utils';
import { type SST_Cell, type SST_RowData, type SST_TableInstance } from '../../types';
import { isCellEditable, cellKeyboardShortcuts, openEditingCell } from '../../utils/cell.utils';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_CopyButton } from '../buttons/SST_CopyButton';
import { SST_EditCellTextField } from '../inputs/SST_EditCellTextField';

export interface SST_TableBodyCellProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'td'> {
  cell: SST_Cell<TData>;
  /**
   * Render-state primitives lifted from `table.getState()` at the body level
   * (see SST_TableBody). Passing them as discrete props instead of reading
   * the wide state inside every cell is what lets `Memo_SST_TableBodyCell`
   * bail correctly on narrow state changes — hovering one row no longer
   * re-renders every cell.
   */
  density: 'compact' | 'comfortable' | 'spacious';
  isActionCell: boolean;
  isCreatingRow: boolean;
  isDraggingColumn: boolean;
  isDraggingRow: boolean;
  isEditingCell: boolean;
  isEditingRow: boolean;
  isHoveredColumn: boolean;
  isHoveredRow: boolean;
  isLoading: boolean;
  isResizingThisColumn: boolean;
  isRtl: boolean;
  numRows?: number;
  rowRef: RefObject<HTMLTableRowElement | null>;
  showSkeletons: boolean;
  staticColumnIndex?: number;
  staticRowIndex: number;
  table: SST_TableInstance<TData>;
}

export const SST_TableBodyCell = <TData extends SST_RowData>({
  cell,
  className,
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
  ...rest
}: SST_TableBodyCellProps<TData>) => {
  const {
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
  // Invariant: skeleton width is measured exactly once per cell lifetime, on the first
  // loading-entry the effect observes. Ref guard avoids stale closures from re-running deps.
  const measuredOnce = useRef(false);
  useEffect(() => {
    if ((!isLoading && !showSkeletons) || measuredOnce.current) return;
    measuredOnce.current = true;
    const size = column.getSize();
    setSkeletonWidth(
      columnDefType === 'display'
        ? size / 2
        : Math.round(Math.random() * (size - size / 3) + size / 3),
    );
  }, [isLoading, showSkeletons, column, columnDefType]);

  const isEditable = isCellEditable({ cell, table });

  const isEditing =
    isEditable &&
    !['custom', 'modal'].includes(editDisplayMode as string) &&
    (editDisplayMode === 'table' || isEditingRow || isEditingCell) &&
    !row.getIsGrouped();

  const isCreating = isEditable && createDisplayMode === 'row' && isCreatingRow;

  const draggingBorders = useMemo(() => {
    const isFirstColumn = column.getIsFirstColumn();
    const isLastColumn = column.getIsLastColumn();
    const isLastRow = numRows && staticRowIndex === numRows - 1;
    const showResizeBorder = isResizingThisColumn && columnResizeMode === 'onChange';

    const borderStyle = showResizeBorder
      ? `2px solid ${draggingBorderColor}`
      : isDraggingColumn || isDraggingRow
        ? `1px dashed color-mix(in oklch, var(--foreground) 50%, transparent)`
        : isHoveredColumn || isHoveredRow || isResizingThisColumn
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
            isDraggingRow || isHoveredRow || (isLastRow && !isResizingThisColumn)
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional narrow deps. column/columnResizeMode/columnResizeDirection/draggingBorderColor are stable for the cell's lifetime (column-resize mode is an option, not state).
  }, [
    isDraggingColumn,
    isDraggingRow,
    isHoveredColumn,
    isHoveredRow,
    isResizingThisColumn,
    numRows,
    staticRowIndex,
  ]);

  const isColumnPinned =
    enableColumnPinning && columnDef.columnDefType !== 'group' && column.getIsPinned();

  const showClickToCopyButton =
    (parseFromValuesOrFunc(enableClickToCopy, cell) === true ||
      parseFromValuesOrFunc(columnDef.enableClickToCopy, cell) === true) &&
    !['context-menu', false].includes(
      // @ts-expect-error -- Array.prototype.includes's narrowed (string | false) signature doesn't accept the wider union returned by parseFromValuesOrFunc; the runtime check is intentional
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
    // Handlers run on user events, not on every render — reading state once
    // here is cheap and keeps the render path free of getState() calls.
    const { draggingColumn: dragCol, hoveredColumn: hoverCol } = table.getState();
    if (enableGrouping && hoverCol?.id === 'drop-zone') {
      setHoveredColumn(null);
    }
    if (enableColumnOrdering && dragCol) {
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
        outline: isActionCell
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
      className={cn(
        columnDefType === 'display' ? 'overflow-visible' : 'overflow-hidden',
        'outline-offset-[-1px]',
        className,
        tableCellProps?.className,
      )}
    >
      {tableCellProps.children ?? (
        <>
          {cell.getIsPlaceholder() ? (
            (columnDef.PlaceholderCell?.({ cell, column, row, table }) ?? null)
          ) : showSkeletons !== false && (isLoading || showSkeletons) ? (
            <Skeleton className="h-5" style={{ width: skeletonWidth }} {...skeletonProps} />
          ) : columnDefType === 'display' &&
            (['sst-row-expand', 'sst-row-numbers', 'sst-row-select'].includes(column.id) ||
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
            <SST_EditCellTextField cell={cell} table={table} />
          ) : showClickToCopyButton && columnDef.enableClickToCopy !== false ? (
            <SST_CopyButton cell={cell} table={table}>
              <SST_TableBodyCellValue {...cellValueProps} />
            </SST_CopyButton>
          ) : (
            <SST_TableBodyCellValue {...cellValueProps} />
          )}
          {cell.getIsGrouped() && !columnDef.GroupedCell && <> ({row.subRows?.length})</>}
        </>
      )}
    </td>
  );
};

// The comparator previously bailed any time the cell reference matched —
// which dropped re-renders triggered by hover/drag/edit because those used
// to be read from `getState()` inside the component and the comparator
// couldn't see them. Now those signals come in as discrete primitive props,
// so a shallow-equal of the render-relevant ones is the correct gate.
// `cell` is compared by reference, not by id. TanStack regenerates Cell
// instances when the underlying row model changes — including the common
// case of replacing `data` immutably while keeping `getRowId` stable. An
// id-based check would incorrectly bail there and leave stale values on
// screen. The column-ref stability layer in useSST_TableInstance keeps
// cells warm across narrow state changes (hover/drag/edit), so this is
// both correct and fast.
export const Memo_SST_TableBodyCell = memo(SST_TableBodyCell, (prev, next) => {
  return (
    prev.cell === next.cell &&
    prev.density === next.density &&
    prev.isActionCell === next.isActionCell &&
    prev.isCreatingRow === next.isCreatingRow &&
    prev.isDraggingColumn === next.isDraggingColumn &&
    prev.isDraggingRow === next.isDraggingRow &&
    prev.isEditingCell === next.isEditingCell &&
    prev.isEditingRow === next.isEditingRow &&
    prev.isHoveredColumn === next.isHoveredColumn &&
    prev.isHoveredRow === next.isHoveredRow &&
    prev.isLoading === next.isLoading &&
    prev.isResizingThisColumn === next.isResizingThisColumn &&
    prev.isRtl === next.isRtl &&
    prev.numRows === next.numRows &&
    prev.showSkeletons === next.showSkeletons &&
    prev.staticColumnIndex === next.staticColumnIndex &&
    prev.staticRowIndex === next.staticRowIndex
  );
}) as typeof SST_TableBodyCell;
