// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import { memo, useMemo } from 'react';
import { type VirtualItem } from '@tanstack/react-virtual';
import { MRT_TableBodyRow, Memo_MRT_TableBodyRow } from './MRT_TableBodyRow';
import { useMRT_RowVirtualizer } from '../../hooks/useMRT_RowVirtualizer';
import { useMRT_Rows } from '../../hooks/useMRT_Rows';
import { cn } from '../../lib/utils';
import {
  type MRT_ColumnVirtualizer,
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableBodyProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'tbody'> {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableBody = <TData extends MRT_RowData>({
  className,
  columnVirtualizer,
  table,
  ...rest
}: MRT_TableBodyProps<TData>) => {
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
  const { columnFilters, globalFilter, isFullScreen, rowPinning } = getState();

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
  }, [rowPinning, getRowModel().rows]);

  const rows = useMRT_Rows(table);
  const rowVirtualizer = useMRT_RowVirtualizer(table, rows);
  const { virtualRows } = rowVirtualizer ?? {};

  const isGrid = !!layoutMode?.startsWith('grid');

  const commonRowProps = {
    columnVirtualizer,
    numRows: rows.length,
    table,
  };

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
              row,
              staticRowIndex,
            };
            return memoMode === 'rows' ? (
              <Memo_MRT_TableBodyRow key={row.id} {...props} />
            ) : (
              <MRT_TableBodyRow key={row.id} {...props} />
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
                let row = rowOrVirtualRow as MRT_Row<TData>;
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
                  pinnedRowIds,
                  row,
                  rowVirtualizer,
                  staticRowIndex,
                  virtualRow: rowVirtualizer ? (rowOrVirtualRow as VirtualItem) : undefined,
                };
                const key = `${row.id}-${row.index}`;
                return memoMode === 'rows' ? (
                  <Memo_MRT_TableBodyRow key={key} {...props} />
                ) : (
                  <MRT_TableBodyRow key={key} {...props} />
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
              row,
              staticRowIndex,
            };
            return memoMode === 'rows' ? (
              <Memo_MRT_TableBodyRow key={row.id} {...props} />
            ) : (
              <MRT_TableBodyRow key={row.id} {...props} />
            );
          })}
        </tbody>
      )}
    </>
  );
};

export const Memo_MRT_TableBody = memo(
  MRT_TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data,
) as typeof MRT_TableBody;
