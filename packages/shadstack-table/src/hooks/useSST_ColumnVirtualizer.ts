import { useCallback, useMemo } from 'react';
import { type Range, useVirtualizer } from '@tanstack/react-virtual';
import { type SST_ColumnVirtualizer, type SST_RowData, type SST_TableInstance } from '../types';
import { parseFromValuesOrFunc } from '../utils/utils';
import { extraIndexRangeExtractor } from '../utils/virtualization.utils';

export const useSST_ColumnVirtualizer = <
  TData extends SST_RowData,
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableCellElement,
>(
  table: SST_TableInstance<TData>,
): SST_ColumnVirtualizer | undefined => {
  const {
    getState,
    options: {
      columnVirtualizerInstanceRef,
      columnVirtualizerOptions,
      enableColumnPinning,
      enableColumnVirtualization,
    },
    refs: { tableContainerRef },
  } = table;
  const { columnPinning, columnVisibility, draggingColumn } = getState();

  if (!enableColumnVirtualization) return undefined;

  const columnVirtualizerProps = parseFromValuesOrFunc(columnVirtualizerOptions, {
    table,
  });

  const visibleColumns = table.getVisibleLeafColumns();

  const [leftPinnedIndexes, rightPinnedIndexes] = useMemo(
    () =>
      enableColumnPinning
        ? [
            table.getLeftVisibleLeafColumns().map((c) => c.getPinnedIndex()),
            table
              .getRightVisibleLeafColumns()
              .map((column) => visibleColumns.length - column.getPinnedIndex() - 1)
              .sort((a, b) => a - b),
          ]
        : [[], []],
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional invalidation keys: the memo body reads through `table.*` accessors so columnPinning/columnVisibility/enableColumnPinning act as recompute triggers. table and visibleColumns.length are stable per render of this hook.
    [columnPinning, columnVisibility, enableColumnPinning],
  );

  const numPinnedLeft = leftPinnedIndexes.length;
  const numPinnedRight = rightPinnedIndexes.length;

  const draggingColumnIndex = useMemo(
    () =>
      draggingColumn?.id ? visibleColumns.findIndex((c) => c.id === draggingColumn?.id) : undefined,
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: visibleColumns is read freshly each render, so we only need to recompute the index when the dragged column id changes. Including visibleColumns would re-fire on every render.
    [draggingColumn?.id],
  );

  const columnVirtualizer = useVirtualizer({
    count: visibleColumns.length,
    estimateSize: (index) => visibleColumns[index].getSize(),
    getScrollElement: () => tableContainerRef.current,
    horizontal: true,
    overscan: 3,
    rangeExtractor: useCallback(
      (range: Range) => {
        const newIndexes = extraIndexRangeExtractor(range, draggingColumnIndex);
        if (!numPinnedLeft && !numPinnedRight) {
          return newIndexes;
        }
        return [...new Set([...leftPinnedIndexes, ...newIndexes, ...rightPinnedIndexes])];
      },
      // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: numPinnedLeft/numPinnedRight are derived (length of the array deps) so changes flow through leftPinnedIndexes/rightPinnedIndexes; adding them explicitly would duplicate the trigger.
      [leftPinnedIndexes, rightPinnedIndexes, draggingColumnIndex],
    ),
    ...columnVirtualizerProps,
  }) as unknown as SST_ColumnVirtualizer<TScrollElement, TItemElement>;

  const virtualColumns = columnVirtualizer.getVirtualItems();
  columnVirtualizer.virtualColumns = virtualColumns as any;
  const numColumns = virtualColumns.length;

  if (numColumns) {
    const totalSize = columnVirtualizer.getTotalSize();

    const leftNonPinnedStart = virtualColumns[numPinnedLeft]?.start || 0;
    const leftNonPinnedEnd = virtualColumns[leftPinnedIndexes.length - 1]?.end || 0;

    const rightNonPinnedStart = virtualColumns[numColumns - numPinnedRight]?.start || 0;
    const rightNonPinnedEnd = virtualColumns[numColumns - numPinnedRight - 1]?.end || 0;

    columnVirtualizer.virtualPaddingLeft = leftNonPinnedStart - leftNonPinnedEnd;

    columnVirtualizer.virtualPaddingRight =
      totalSize - rightNonPinnedEnd - (numPinnedRight ? totalSize - rightNonPinnedStart : 0);
  }

  if (columnVirtualizerInstanceRef) {
    // @ts-expect-error -- columnVirtualizer is widened with our augmented .virtualColumns / padding fields; the public types don't yet model the augmentation
    columnVirtualizerInstanceRef.current = columnVirtualizer;
  }

  return columnVirtualizer as any;
};
