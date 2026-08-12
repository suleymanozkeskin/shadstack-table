import { useEffect, useReducer, useRef } from 'react';
import { type SST_RowData, type SST_SortingState, type SST_TableInstance } from '../types';
import { getAllLeafColumnDefs, getColumnId } from '../utils/column.utils';
import { getDefaultColumnOrderIds } from '../utils/displayColumn.utils';
import { getCanRankRows } from '../utils/row.utils';

/**
 * Table-level side effects.
 *
 * State-driven behaviours run as store/atom subscriptions registered once at
 * mount, NOT as render-phase state reads — this hook deliberately consumes no
 * state during render, so the host's `useTable` selector stays narrow and a
 * hover or resize tick does not re-render the whole tree just to feed these
 * effects. Options-driven behaviours (column signature, data-driven page
 * bounds) stay render-driven: options changes always re-render the host
 * because the consumer re-rendered it.
 */
export const useSST_Effects = <TData extends SST_RowData>(table: SST_TableInstance<TData>) => {
  const rerender = useReducer(() => ({}), {})[1];
  const initialBodyHeight = useRef<string>(null);
  const previousTop = useRef<number>(null);
  const fullscreenAppliedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialBodyHeight.current = document.body.style.height;
    }
  }, []);

  //recalculate column order when the set of column ids changes — not just the
  //count — so swapping columns for a same-length array with different ids
  //still triggers a rebuild
  const sourceColumnSignature = getAllLeafColumnDefs(table.options.columns)
    .map(getColumnId)
    .join('|');
  useEffect(() => {
    //`options.state` holds only consumer-controlled state, so build the
    //stateful view the column-order derivation expects from the live state
    table.setColumnOrder(
      getDefaultColumnOrderIds({ ...table.options, state: table.getState() } as Parameters<
        typeof getDefaultColumnOrderIds<TData>
      >[0]),
    );
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-fire when the column-id signature changes; `table` is a stable instance and depending on it would cause this to fire on every state change.
  }, [sourceColumnSignature]);

  //if page index is out of bounds, set it to the last page. The clamp fires
  //only when its inputs (row count, loading flags) actually change — the
  //original effect's dependency contract — so a consumer intentionally
  //setting an out-of-range pageIndex is still left alone.
  const lastBoundsInputs = useRef<null | { count: number; enabled: boolean; loading: boolean }>(
    null,
  );
  const checkPageBounds = () => {
    const { enablePagination, rowCount } = table.options;
    const { isLoading, pagination, showSkeletons } = table.getState();
    const enabled = !!enablePagination;
    const loading = !!isLoading || !!showSkeletons;
    const count = rowCount ?? table.getPrePaginatedRowModel().rows.length;
    const prev = lastBoundsInputs.current;
    lastBoundsInputs.current = { count, enabled, loading };
    if (prev && prev.count === count && prev.enabled === enabled && prev.loading === loading) {
      return;
    }
    if (!enabled || loading) return;

    const { pageIndex, pageSize } = pagination;
    const totalPages: number = count > 0 ? Math.ceil(count / pageSize) : 1;
    const isOutOfBounds: boolean = pageIndex < 0 || pageIndex >= totalPages;
    if (isOutOfBounds) {
      table.setPageIndex(totalPages - 1);
    }
  };
  //covers data/options-driven changes: new data always re-renders the host
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional: runs after every host render, self-guarded by the inputs ref above.
  useEffect(() => {
    checkPageBounds();
  });

  //fullscreen scrollbar handling, ranked-sort save/restore, pinned-row
  //restyle, and state-driven page bounds — all as subscriptions on the
  //stable table's atoms, registered once.
  const userIntendedSort = useRef<SST_SortingState>([]);
  const prevGlobalFilter = useRef<unknown>(undefined);
  useEffect(() => {
    const applyFullscreen = (isFullScreen: boolean | undefined) => {
      if (typeof window === 'undefined') return;
      if (isFullScreen && !fullscreenAppliedRef.current) {
        fullscreenAppliedRef.current = true;
        previousTop.current = document.body.getBoundingClientRect().top; //save scroll position
        document.body.style.height = '100dvh'; //hide page scrollbars in full screen mode
      } else if (!isFullScreen && fullscreenAppliedRef.current) {
        fullscreenAppliedRef.current = false;
        document.body.style.height = initialBodyHeight.current ?? '';
        if (!previousTop.current) return;
        //restore scroll position
        window.scrollTo({ behavior: 'instant', top: -1 * previousTop.current });
      }
    };

    //turn off sort while the global filter is ranking results, and restore
    //the user's previous sort (including an intentionally cleared []) when
    //the filter is removed
    const applyRankedSortDance = (globalFilter: unknown) => {
      if (!getCanRankRows(table)) return;
      if (globalFilter && !prevGlobalFilter.current) {
        //entering ranked-filter mode — snapshot the current sort to restore later
        userIntendedSort.current = table.getState().sorting;
        table.setSorting([]);
      } else if (!globalFilter && prevGlobalFilter.current) {
        //leaving ranked-filter mode — restore the snapshot exactly, including []
        table.setSorting(() => userIntendedSort.current);
      }
      prevGlobalFilter.current = globalFilter;
    };

    //fix pinned row top style when density changes
    const applyPinnedRowRestyle = () => {
      if (table.options.enableRowPinning && table.getIsSomeRowsPinned()) {
        setTimeout(() => {
          rerender();
        }, 150);
      }
    };

    const initial = table.getState();
    userIntendedSort.current = initial.sorting;
    prevGlobalFilter.current = initial.globalFilter;
    //a table mounted in full screen must apply the body styles immediately
    applyFullscreen(initial.isFullScreen);

    const subscriptions = [
      table.atoms.isFullScreen.subscribe(applyFullscreen),
      table.atoms.globalFilter.subscribe(applyRankedSortDance),
      table.atoms.density.subscribe(applyPinnedRowRestyle),
      //state-driven row-model changes (filters, grouping, …) re-check bounds
      (
        table as unknown as {
          store: { subscribe: (fn: () => void) => { unsubscribe: () => void } };
        }
      ).store.subscribe(checkPageBounds),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      //leaving the page while in full screen must not leak the body height
      applyFullscreen(false);
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-once registration: `table` is referentially stable and the handlers read live state/options off it.
  }, []);
};
