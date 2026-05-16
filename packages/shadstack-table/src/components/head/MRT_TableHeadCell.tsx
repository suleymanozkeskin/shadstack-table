// oxlint-disable jsx-a11y/click-events-have-key-events -- verbatim port of upstream MRT
// oxlint-disable jsx-a11y/no-static-element-interactions -- verbatim port of upstream MRT
// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
// oxlint-disable typescript/no-non-null-asserted-optional-chain -- verbatim port of upstream MRT
import * as React from 'react';
import { type DragEvent, useMemo, useCallback } from 'react';
import { MRT_TableHeadCellColumnActionsButton } from './MRT_TableHeadCellColumnActionsButton';
import { MRT_TableHeadCellFilterContainer } from './MRT_TableHeadCellFilterContainer';
import { MRT_TableHeadCellFilterLabel } from './MRT_TableHeadCellFilterLabel';
import { MRT_TableHeadCellGrabHandle } from './MRT_TableHeadCellGrabHandle';
import { MRT_TableHeadCellResizeHandle } from './MRT_TableHeadCellResizeHandle';
import { MRT_TableHeadCellSortLabel } from './MRT_TableHeadCellSortLabel';
import { cn } from '../../lib/utils';
import {
  type MRT_ColumnVirtualizer,
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { cellKeyboardShortcuts } from '../../utils/cell.utils';

export interface MRT_TableHeadCellProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'th'> {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  header: MRT_Header<TData>;
  staticColumnIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCell = <TData extends MRT_RowData>({
  className,
  columnVirtualizer,
  header,
  staticColumnIndex,
  table,
  ...rest
}: MRT_TableHeadCellProps<TData>) => {
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

  const padding =
    density === 'compact'
      ? '0.5rem'
      : density === 'comfortable'
        ? columnDefType === 'display'
          ? '0.75rem'
          : '1rem'
        : columnDefType === 'display'
          ? '1rem 1.25rem'
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
        padding,
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
      className={cn('align-top font-bold overflow-visible', className, tableCellProps?.className)}
    >
      {header.isPlaceholder
        ? null
        : (tableCellProps.children ?? (
            <div
              className={cn(
                'Mui-TableHeadCell-Content relative w-full flex items-center',
                tableCellProps?.style?.textAlign === 'right' ? 'flex-row-reverse' : 'flex-row',
                columnDefType === 'group' || (tableCellProps as any)?.align === 'center'
                  ? 'justify-center'
                  : column.getCanResize()
                    ? 'justify-between'
                    : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'Mui-TableHeadCell-Content-Labels flex items-center',
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
                    'Mui-TableHeadCell-Content-Wrapper text-ellipsis hover:text-clip',
                    columnDefType === 'data' && 'overflow-hidden',
                    (columnDef.header?.length ?? 0) < 20
                      ? 'whitespace-nowrap'
                      : 'whitespace-normal',
                  )}
                  style={{
                    minWidth: `${Math.min(columnDef.header?.length ?? 0, 4)}ch`,
                  }}
                >
                  {HeaderElement}
                </div>
                {column.getCanFilter() && (
                  <MRT_TableHeadCellFilterLabel header={header} table={table} />
                )}
                {column.getCanSort() && (
                  <MRT_TableHeadCellSortLabel header={header} table={table} />
                )}
              </div>
              {columnDefType !== 'group' && (
                <div className="Mui-TableHeadCell-Content-Actions whitespace-nowrap">
                  {showDragHandle && (
                    <MRT_TableHeadCellGrabHandle
                      column={column}
                      table={table}
                      tableHeadCellRef={{
                        current: tableHeadCellRefs.current?.[column.id]!,
                      }}
                    />
                  )}
                  {showColumnActions && (
                    <MRT_TableHeadCellColumnActionsButton header={header} table={table} />
                  )}
                </div>
              )}
              {column.getCanResize() && (
                <MRT_TableHeadCellResizeHandle header={header} table={table} />
              )}
            </div>
          ))}
      {columnFilterDisplayMode === 'subheader' && column.getCanFilter() && (
        <MRT_TableHeadCellFilterContainer header={header} table={table} />
      )}
    </th>
  );
};
