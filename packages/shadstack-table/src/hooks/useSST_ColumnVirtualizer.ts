import { useSST_Virtualizer } from './useSST_Virtualizer';
import { useCallback, useMemo, useLayoutEffect } from 'react';
import { type Range } from '@tanstack/react-virtual';
import { useSST_TableState } from './useSST_TableState';
import { type SST_ColumnVirtualizer, type SST_RowData, type SST_TableInstance } from '../types';
import { parseFromValuesOrFunc } from '../utils/utils';
import { extraIndexRangeExtractor } from '../utils/virtualization.utils';

export const useSST_ColumnVirtualizer = <TData extends SST_RowData>(
  table: SST_TableInstance<TData>,
): SST_ColumnVirtualizer | undefined => {
  const {
    options: {
      columnVirtualizerInstanceRef,
      columnVirtualizerOptions,
      enableColumnPinning,
      enableColumnVirtualization,
    },
    refs: { tableContainerRef },
  } = table;

  const { columnPinning, columnVisibility, draggingColumn } = useSST_TableState(table, (s) => ({
    columnOrder: s.columnOrder,
    columnPinning: s.columnPinning,
    columnVisibility: s.columnVisibility,
    draggingColumn: s.draggingColumn,
  }));

  const columnVirtualizerProps = parseFromValuesOrFunc(columnVirtualizerOptions, {
    table,
  });

  const visibleColumns = table.getVisibleLeafColumns();

  const [leftPinnedIndexes, rightPinnedIndexes] = useMemo(
    () =>
      enableColumnPinning
        ? [
            table.getStartVisibleLeafColumns().map((c) => c.getPinnedIndex()),
            table
              .getEndVisibleLeafColumns()
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

  const instance = useSST_Virtualizer<HTMLDivElement, HTMLTableCellElement>({
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
    enabled: !!enableColumnVirtualization,
  });

  const virtualColumns = instance.getVirtualItems();

  let virtualPaddingLeft = 0;
  let virtualPaddingRight = 0;

  const numColumns = virtualColumns.length;

  if (numColumns) {
    const totalSize = instance.getTotalSize();

    const leftNonPinnedStart = virtualColumns[numPinnedLeft]?.start || 0;
    const leftNonPinnedEnd = virtualColumns[leftPinnedIndexes.length - 1]?.end || 0;

    const rightNonPinnedStart = virtualColumns[numColumns - numPinnedRight]?.start || 0;
    const rightNonPinnedEnd = virtualColumns[numColumns - numPinnedRight - 1]?.end || 0;

    virtualPaddingLeft = leftNonPinnedStart - leftNonPinnedEnd;

    virtualPaddingRight =
      totalSize - rightNonPinnedEnd - (numPinnedRight ? totalSize - rightNonPinnedStart : 0);
  }

  const columnVirtualizer = Object.freeze({
    ...instance,
    virtualColumns,
    virtualPaddingLeft,
    virtualPaddingRight,
  });

  useLayoutEffect(() => {
    if (!columnVirtualizerInstanceRef) return;
    columnVirtualizerInstanceRef.current = enableColumnVirtualization ? columnVirtualizer : null;

    return () => {
      columnVirtualizerInstanceRef.current = null;
    };
  }, [columnVirtualizerInstanceRef, enableColumnVirtualization, columnVirtualizer]);

  return enableColumnVirtualization ? columnVirtualizer : undefined;
};
