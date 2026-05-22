import * as React from 'react';
import { memo, useMemo } from 'react';
import { type VirtualItem } from '@tanstack/react-virtual';
import { SST_TableBodyRow, Memo_SST_TableBodyRow } from './SST_TableBodyRow';
import { useSST_RowVirtualizer } from '../../hooks/useSST_RowVirtualizer';
import { useSST_Rows } from '../../hooks/useSST_Rows';
import { cn } from '../../lib/utils';
import {
  type SST_ColumnVirtualizer,
  type SST_Row,
  type SST_RowData,
  type SST_TableInstance,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_TableBodyProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'tbody'> {
  columnVirtualizer?: SST_ColumnVirtualizer;
  table: SST_TableInstance<TData>;
}

export const SST_TableBody = <TData extends SST_RowData>({
  className,
  columnVirtualizer,
  table,
  ...rest
}: SST_TableBodyProps<TData>) => {
  const {
    getBottomRows,
    getIsSomeRowsPinned,
    getRowModel,
    getState,
    getTopRows,
    options: {
      enableStickyFooter,
      enableStickyHeader,
      layoutMode,
      localization,
      memoMode,
      renderDetailPanel,
      renderEmptyRowsFallback,
      rowPinningDisplayMode,
      slotProps,
    },
    refs: { tableFooterRef, tableHeadRef, tablePaperRef },
  } = table;
  // Single point of subscription to table state. Each child row receives
  // narrow primitive props derived from this snapshot, which lets the
  // row/cell memos bail correctly on irrelevant state changes (see the
  // comparators in SST_TableBodyRow and SST_TableBodyCell).
  const {
    actionCell,
    columnFilters,
    columnSizingInfo,
    creatingRow,
    density,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    globalFilter,
    hoveredColumn,
    hoveredRow,
    isFullScreen,
    isLoading,
    rowPinning,
    showSkeletons,
  } = getState();

  const actionCellId = actionCell?.id ?? null;
  const draggingColumnId = draggingColumn?.id ?? null;
  const draggingRowId = draggingRow?.id ?? null;
  const editingCellId = editingCell?.id ?? null;
  const editingCellRowId = editingCell?.row?.id ?? null;
  const editingRowId = editingRow?.id ?? null;
  const hoveredColumnId = hoveredColumn?.id ?? null;
  const hoveredRowId = hoveredRow?.id ?? null;
  const resizingColumnId = columnSizingInfo.isResizingColumn ?? false;
  const creatingRowId = creatingRow?.id ?? null;
  // RTL is resolved once at the body level — the previous per-cell
  // `document.documentElement.dir` read was a synchronous DOM access on
  // every render of every cell.
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  const tableBodyProps = {
    ...parseFromValuesOrFunc(slotProps?.tableBody, { table }),
    ...rest,
  };

  const tableHeadHeight =
    ((enableStickyHeader || isFullScreen) && tableHeadRef.current?.clientHeight) || 0;
  const tableFooterHeight = (enableStickyFooter && tableFooterRef.current?.clientHeight) || 0;

  const pinnedRowIds = useMemo(() => {
    if (!rowPinning.bottom?.length && !rowPinning.top?.length) return [];
    const ids: string[] = [];
    for (const row of getRowModel().rows) {
      if (row.getIsPinned()) ids.push(row.id);
    }
    return ids;
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: getRowModel() is a stable accessor from the TanStack table instance; using its `.rows` snapshot as a dep tracks row-model identity changes without retaining a getRowModel reference. FOLLOW-UP: extract `const rowModelRows = getRowModel().rows` to satisfy the complex-expression rule.
  }, [rowPinning, getRowModel().rows]);

  const rows = useSST_Rows(table);
  const rowVirtualizer = useSST_RowVirtualizer(table, rows);
  const { virtualRows } = rowVirtualizer ?? {};

  const isGrid = !!layoutMode?.startsWith('grid');

  // Table-wide props every row sees identically. Per-row narrow primitives
  // (isHoveredRow, editingCellIdInRow, ...) are appended via `rowStateProps`
  // at each call site so the row's memo comparator sees stable refs for
  // rows that don't match the hovered/editing/dragging target.
  const commonRowProps = {
    columnVirtualizer,
    density,
    draggingColumnId,
    hoveredColumnId,
    isFullScreen,
    isLoading,
    isRtl,
    numRows: rows.length,
    resizingColumnId,
    showSkeletons,
    table,
  };

  const rowStateProps = (rowId: string) => ({
    actionCellId,
    editingCellIdInRow: editingCellRowId === rowId ? editingCellId : null,
    isCreatingRow: creatingRowId === rowId,
    isDraggingRow: draggingRowId === rowId,
    isEditingRow: editingRowId === rowId,
    isHoveredRow: hoveredRowId === rowId,
  });

  return (
    <>
      {!rowPinningDisplayMode?.includes('sticky') && getIsSomeRowsPinned('top') && (
        <tbody
          {...tableBodyProps}
          style={{
            top: tableHeadHeight - 1,
            ...tableBodyProps?.style,
          }}
          className={cn('sticky z-[1]', isGrid && 'grid', className, tableBodyProps?.className)}
        >
          {getTopRows().map((row, staticRowIndex) => {
            const props = {
              ...commonRowProps,
              ...rowStateProps(row.id),
              row,
              staticRowIndex,
            };
            return memoMode === 'rows' ? (
              <Memo_SST_TableBodyRow key={row.id} {...props} />
            ) : (
              <SST_TableBodyRow key={row.id} {...props} />
            );
          })}
        </tbody>
      )}
      <tbody
        {...tableBodyProps}
        style={{
          height: rowVirtualizer ? `${rowVirtualizer.getTotalSize()}px` : undefined,
          minHeight: !rows.length ? '100px' : undefined,
          ...tableBodyProps?.style,
        }}
        className={cn('relative', isGrid && 'grid', className, tableBodyProps?.className)}
      >
        {tableBodyProps?.children ??
          (!rows.length ? (
            <tr style={{ display: isGrid ? 'grid' : undefined }}>
              <td
                colSpan={table.getVisibleLeafColumns().length}
                style={{ display: isGrid ? 'grid' : undefined }}
              >
                {renderEmptyRowsFallback?.({ table }) ?? (
                  <p
                    className="text-muted-foreground italic py-8 text-center w-full"
                    style={{
                      maxWidth: `min(100vw, ${
                        tablePaperRef.current?.clientWidth
                          ? tablePaperRef.current?.clientWidth + 'px'
                          : '100%'
                      })`,
                    }}
                  >
                    {globalFilter || columnFilters.length
                      ? localization.noResultsFound
                      : localization.noRecordsToDisplay}
                  </p>
                )}
              </td>
            </tr>
          ) : (
            <>
              {(virtualRows ?? rows).map((rowOrVirtualRow, staticRowIndex) => {
                let row = rowOrVirtualRow as SST_Row<TData>;
                if (rowVirtualizer) {
                  if (renderDetailPanel) {
                    if (rowOrVirtualRow.index % 2 === 1) {
                      return null;
                    } else {
                      staticRowIndex = rowOrVirtualRow.index / 2;
                    }
                  } else {
                    staticRowIndex = rowOrVirtualRow.index;
                  }
                  row = rows[staticRowIndex];
                }
                const props = {
                  ...commonRowProps,
                  ...rowStateProps(row.id),
                  pinnedRowIds,
                  row,
                  rowVirtualizer,
                  staticRowIndex,
                  virtualRow: rowVirtualizer ? (rowOrVirtualRow as VirtualItem) : undefined,
                };
                const key = `${row.id}-${row.index}`;
                return memoMode === 'rows' ? (
                  <Memo_SST_TableBodyRow key={key} {...props} />
                ) : (
                  <SST_TableBodyRow key={key} {...props} />
                );
              })}
            </>
          ))}
      </tbody>
      {!rowPinningDisplayMode?.includes('sticky') && getIsSomeRowsPinned('bottom') && (
        <tbody
          {...tableBodyProps}
          style={{
            bottom: tableFooterHeight - 1,
            ...tableBodyProps?.style,
          }}
          className={cn('sticky z-[1]', isGrid && 'grid', className, tableBodyProps?.className)}
        >
          {getBottomRows().map((row, staticRowIndex) => {
            const props = {
              ...commonRowProps,
              ...rowStateProps(row.id),
              row,
              staticRowIndex,
            };
            return memoMode === 'rows' ? (
              <Memo_SST_TableBodyRow key={row.id} {...props} />
            ) : (
              <SST_TableBodyRow key={row.id} {...props} />
            );
          })}
        </tbody>
      )}
    </>
  );
};

// Memoizes the body while a column is being resized. The previous
// comparator skipped re-renders whenever `data` was reference-stable, which
// also swallowed selection/filter/pagination updates whose row arrays
// didn't change identity. Now the memo skips *only* while the user is
// actively dragging a column resize handle — every other state change
// flows through unimpeded.
export const Memo_SST_TableBody = memo(
  SST_TableBody,
  (_prev, next) => !!next.table.getState().columnSizingInfo.isResizingColumn,
) as typeof SST_TableBody;
