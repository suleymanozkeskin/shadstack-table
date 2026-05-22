import * as React from 'react';
import { type DragEvent, useMemo, useCallback } from 'react';
import { SST_TableHeadCellColumnActionsButton } from './SST_TableHeadCellColumnActionsButton';
import { SST_TableHeadCellFilterContainer } from './SST_TableHeadCellFilterContainer';
import { SST_TableHeadCellFilterLabel } from './SST_TableHeadCellFilterLabel';
import { SST_TableHeadCellGrabHandle } from './SST_TableHeadCellGrabHandle';
import { SST_TableHeadCellResizeHandle } from './SST_TableHeadCellResizeHandle';
import { SST_TableHeadCellSortLabel } from './SST_TableHeadCellSortLabel';
import { cn } from '../../lib/utils';
import {
  type SST_ColumnVirtualizer,
  type SST_Header,
  type SST_RowData,
  type SST_TableInstance,
} from '../../types';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { cellKeyboardShortcuts } from '../../utils/cell.utils';

export interface SST_TableHeadCellProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'th'> {
  columnVirtualizer?: SST_ColumnVirtualizer;
  header: SST_Header<TData>;
  staticColumnIndex?: number;
  table: SST_TableInstance<TData>;
}

export const SST_TableHeadCell = <TData extends SST_RowData>({
  className,
  columnVirtualizer,
  header,
  staticColumnIndex,
  table,
  ...rest
}: SST_TableHeadCellProps<TData>) => {
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const {
    getState,
    options: {
      columnFilterDisplayMode,
      columnResizeDirection,
      columnResizeMode,
      enableKeyboardShortcuts,
      enableColumnActions,
      enableColumnDragging,
      enableColumnOrdering,
      enableColumnPinning,
      enableGrouping,
      enableMultiSort,
      layoutMode,
      mrtTheme: { draggingBorderColor },
      slotProps,
    },
    refs: { tableHeadCellRefs },
    setHoveredColumn,
  } = table;
  const { columnSizingInfo, density, draggingColumn, grouping, hoveredColumn, showColumnFilters } =
    getState();
  const { column } = header;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const tableCellProps = {
    ...parseFromValuesOrFunc(slotProps?.tableHeadCell, { column, table }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.tableHeadCell, {
      column,
      table,
    }),
    ...rest,
  };

  const isColumnPinned =
    enableColumnPinning && columnDef.columnDefType !== 'group' && column.getIsPinned();

  const showColumnActions =
    (enableColumnActions || columnDef.enableColumnActions) &&
    columnDef.enableColumnActions !== false;

  const showDragHandle =
    enableColumnDragging !== false &&
    columnDef.enableColumnDragging !== false &&
    (enableColumnDragging ||
      (enableColumnOrdering && columnDef.enableColumnOrdering !== false) ||
      (enableGrouping && columnDef.enableGrouping !== false && !grouping.includes(column.id)));

  const headerPL = useMemo(() => {
    let pl = 0;
    if (column.getCanSort()) pl += 1;
    if (showColumnActions) pl += 1.75;
    if (showDragHandle) pl += 1.5;
    return pl;
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- column is the table-column proxy; getCanSort() never changes for a given column instance, so the dep list is intentionally narrow. FOLLOW-UP: verify and possibly inline column.getCanSort() into the dep array.
  }, [showColumnActions, showDragHandle]);

  const draggingBorders = useMemo(() => {
    const showResizeBorder =
      columnSizingInfo.isResizingColumn === column.id &&
      columnResizeMode === 'onChange' &&
      !header.subHeaders.length;

    const borderStyle = showResizeBorder
      ? `2px solid ${draggingBorderColor}`
      : draggingColumn?.id === column.id
        ? `1px dashed color-mix(in oklch, var(--foreground) 50%, transparent)`
        : hoveredColumn?.id === column.id
          ? `2px dashed ${draggingBorderColor}`
          : undefined;

    if (showResizeBorder) {
      return columnResizeDirection === 'ltr'
        ? { borderRight: borderStyle }
        : { borderLeft: borderStyle };
    }
    return borderStyle
      ? {
          borderLeft: borderStyle,
          borderRight: borderStyle,
          borderTop: borderStyle,
        }
      : undefined;
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional narrow deps; resize-border state must only react to drag/hover/resize transitions. column.id / columnResizeMode / columnResizeDirection / draggingBorderColor / header.subHeaders.length are effectively per-instance constants over the cell lifetime, and including them would cause unnecessary recomputes during column-resize streams. FOLLOW-UP: verify all listed deps are truly stable.
  }, [draggingColumn, hoveredColumn, columnSizingInfo.isResizingColumn]);

  const handleDragEnter = (_e: DragEvent) => {
    if (enableGrouping && hoveredColumn?.id === 'drop-zone') {
      setHoveredColumn(null);
    }
    if (enableColumnOrdering && draggingColumn && columnDefType !== 'group') {
      setHoveredColumn(columnDef.enableColumnOrdering !== false ? column : null);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (columnDef.enableColumnOrdering !== false) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    tableCellProps?.onKeyDown?.(event);
    cellKeyboardShortcuts({
      event,
      cellValue: header.column.columnDef.header,
      table,
      header,
    });
  };

  const handleRef = useCallback(
    (node: HTMLTableCellElement | null) => {
      if (node) {
        if (tableHeadCellRefs.current) {
          tableHeadCellRefs.current[column.id] = node;
        }
        if (columnDefType !== 'group') {
          columnVirtualizer?.measureElement?.(node);
        }
      }
    },
    [column.id, columnDefType, columnVirtualizer, tableHeadCellRefs],
  );

  const HeaderElement =
    parseFromValuesOrFunc(columnDef.Header, {
      column,
      header,
      table,
    }) ?? columnDef.header;

  const align = columnDefType === 'group' ? 'center' : isRtl ? 'right' : 'left';
  const isGrid = !!layoutMode?.startsWith('grid');

  // Horizontal-only padding: vertical sides are owned by paddingTop/paddingBottom
  // below, so we avoid emitting the `padding` shorthand alongside them — React
  // warns about shorthand/longhand collisions because the shorthand can clobber
  // the longhand depending on declaration order.
  const paddingX =
    density === 'compact'
      ? '0.5rem'
      : density === 'comfortable'
        ? columnDefType === 'display'
          ? '0.75rem'
          : '1rem'
        : columnDefType === 'display'
          ? '1.25rem'
          : '1.5rem';

  const paddingBottom =
    columnDefType === 'display'
      ? 0
      : showColumnFilters || density === 'compact'
        ? '0.4rem'
        : '0.6rem';

  const paddingTop =
    columnDefType === 'group' || density === 'compact'
      ? '0.25rem'
      : density === 'comfortable'
        ? '.75rem'
        : '1.25rem';

  return (
    <th
      aria-sort={
        column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      colSpan={header.colSpan}
      data-can-sort={column.getCanSort() || undefined}
      data-index={staticColumnIndex}
      data-pinned={!!isColumnPinned || undefined}
      data-sort={column.getIsSorted() || undefined}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      ref={handleRef}
      tabIndex={enableKeyboardShortcuts ? 0 : undefined}
      {...tableCellProps}
      onKeyDown={handleKeyDown}
      style={{
        textAlign: align,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingBottom,
        paddingTop,
        userSelect: enableMultiSort && column.getCanSort() ? 'none' : undefined,
        flexDirection: isGrid ? 'column' : undefined,
        ...(getCommonMRTCellStyles({
          column,
          header,
          table,
          tableCellProps,
        }) as React.CSSProperties),
        ...draggingBorders,
        ...tableCellProps?.style,
      }}
      className={cn(
        'border-b bg-card align-top font-medium text-foreground overflow-visible',
        className,
        tableCellProps?.className,
      )}
    >
      {header.isPlaceholder
        ? null
        : (tableCellProps.children ?? (
            <div
              className={cn(
                'SST-TableHeadCell-Content relative w-full flex items-center gap-2',
                tableCellProps?.style?.textAlign === 'right' ? 'flex-row-reverse' : 'flex-row',
                columnDefType === 'group' || (tableCellProps as any)?.align === 'center'
                  ? 'justify-center'
                  : column.getCanResize()
                    ? 'justify-between'
                    : 'justify-start',
              )}
            >
              {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- parent <th> has tabIndex / onKeyDown wired via cellKeyboardShortcuts; this inner div is a click-affordance overlay for the sort label */}
              <div
                className={cn(
                  'SST-TableHeadCell-Content-Labels flex items-center gap-1.5 min-w-0',
                  tableCellProps?.style?.textAlign === 'right' ? 'flex-row-reverse' : 'flex-row',
                  columnDefType === 'data' && 'overflow-hidden',
                  column.getCanSort() && columnDefType !== 'group' && 'cursor-pointer',
                )}
                style={{
                  paddingLeft:
                    (tableCellProps as any)?.align === 'center' ? `${headerPL}rem` : undefined,
                }}
                onClick={column.getToggleSortingHandler()}
              >
                <div
                  className={cn(
                    'SST-TableHeadCell-Content-Wrapper text-ellipsis hover:text-clip',
                    columnDefType === 'data' && 'overflow-hidden',
                    (columnDef.header?.length ?? 0) < 20
                      ? 'whitespace-nowrap'
                      : 'whitespace-normal',
                  )}
                  style={{
                    minWidth:
                      columnDefType === 'display'
                        ? 0
                        : `${Math.min(columnDef.header?.length ?? 0, 4)}ch`,
                  }}
                >
                  {HeaderElement}
                </div>
                {column.getCanFilter() && (
                  <SST_TableHeadCellFilterLabel header={header} table={table} />
                )}
                {column.getCanSort() && (
                  <SST_TableHeadCellSortLabel header={header} table={table} />
                )}
              </div>
              {columnDefType !== 'group' && (
                <div className="SST-TableHeadCell-Content-Actions flex items-center gap-0.5 whitespace-nowrap">
                  {showDragHandle && (
                    <SST_TableHeadCellGrabHandle
                      column={column}
                      table={table}
                      // Invariant: prop type is `RefObject<... | null>`, so passing an
                      // explicit `null` when the parent ref entry hasn't attached yet
                      // is type-safe; the grab handle reads `.current` only inside
                      // event handlers (post-attach), so it tolerates this gracefully.
                      tableHeadCellRef={{
                        current: tableHeadCellRefs.current?.[column.id] ?? null,
                      }}
                    />
                  )}
                  {showColumnActions && (
                    <SST_TableHeadCellColumnActionsButton header={header} table={table} />
                  )}
                </div>
              )}
              {column.getCanResize() && (
                <SST_TableHeadCellResizeHandle header={header} table={table} />
              )}
            </div>
          ))}
      {columnFilterDisplayMode === 'subheader' && column.getCanFilter() && (
        <SST_TableHeadCellFilterContainer header={header} table={table} />
      )}
    </th>
  );
};
