import { useEffect, useReducer, useRef } from 'react';
import { type SST_RowData, type SST_SortingState, type SST_TableInstance } from '../types';
import { getAllLeafColumnDefs, getColumnId } from '../utils/column.utils';
import { getDefaultColumnOrderIds } from '../utils/displayColumn.utils';
import { getCanRankRows } from '../utils/row.utils';

export const useSST_Effects = <TData extends SST_RowData>(table: SST_TableInstance<TData>) => {
  const {
    getIsSomeRowsPinned,
    getPrePaginationRowModel,
    getState,
    options: { enablePagination, enableRowPinning, rowCount },
  } = table;
  const { density, globalFilter, isFullScreen, isLoading, pagination, showSkeletons, sorting } =
    getState();

  const totalRowCount = rowCount ?? getPrePaginationRowModel().rows.length;

  const rerender = useReducer(() => ({}), {})[1];
  const initialBodyHeight = useRef<string>(null);
  const previousTop = useRef<number>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialBodyHeight.current = document.body.style.height;
    }
  }, []);

  //hide scrollbars when table is in full screen mode, preserve body scroll position after full screen exit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isFullScreen) {
        previousTop.current = document.body.getBoundingClientRect().top; //save scroll position
        document.body.style.height = '100dvh'; //hide page scrollbars when table is in full screen mode
      } else {
        document.body.style.height = initialBodyHeight.current as string;
        if (!previousTop.current) return;
        //restore scroll position
        window.scrollTo({
          behavior: 'instant',
          top: -1 * (previousTop.current as number),
        });
      }
    }
  }, [isFullScreen]);

  //recalculate column order when the set of column ids changes — not just the
  //count — so swapping columns for a same-length array with different ids
  //still triggers a rebuild
  const sourceColumnSignature = getAllLeafColumnDefs(table.options.columns)
    .map(getColumnId)
    .join('|');
  useEffect(() => {
    table.setColumnOrder(getDefaultColumnOrderIds(table.options));
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-fire when the column-id signature changes; `table` is a stable instance and depending on it would cause this to fire on every state change.
  }, [sourceColumnSignature]);

  //if page index is out of bounds, set it to the last page
  useEffect(() => {
    if (!enablePagination || isLoading || showSkeletons) return;
    const { pageIndex, pageSize } = pagination;
    const totalPages: number = totalRowCount > 0 ? Math.ceil(totalRowCount / pageSize) : 1;
    const isOutOfBounds: boolean = pageIndex < 0 || pageIndex >= totalPages;

    if (isOutOfBounds) {
      table.setPageIndex(totalPages - 1);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: pagination.pageSize / pageIndex are read but reacting to them would cause infinite-loop on the setPageIndex below. The bounds check only needs to re-run when the row count or loading flags change.
  }, [totalRowCount, enablePagination, isLoading, showSkeletons]);

  //turn off sort when global filter is looking for ranked results, and restore
  //the user's previous sort (including an intentionally cleared empty array)
  //when the filter is removed
  const userIntendedSort = useRef<SST_SortingState>(sorting);
  const prevGlobalFilter = useRef(globalFilter);
  useEffect(() => {
    if (!getCanRankRows(table)) return;
    if (globalFilter && !prevGlobalFilter.current) {
      //entering ranked-filter mode — snapshot the user's current sort to restore later
      userIntendedSort.current = sorting;
      table.setSorting([]);
    } else if (!globalFilter && prevGlobalFilter.current) {
      //leaving ranked-filter mode — restore the snapshot exactly, including []
      table.setSorting(() => userIntendedSort.current);
    }
    prevGlobalFilter.current = globalFilter;
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: sorting is read into a ref snapshot (userIntendedSort), and including it in deps would cause the snapshot to be overwritten every time the user changes sort, defeating the restore-on-filter-exit behavior.
  }, [globalFilter]);

  //fix pinned row top style when density changes
  useEffect(() => {
    if (enableRowPinning && getIsSomeRowsPinned()) {
      setTimeout(() => {
        rerender();
      }, 150);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-fire on density transitions; enableRowPinning is a per-instance option and getIsSomeRowsPinned/rerender are stable accessors.
  }, [density]);
};
