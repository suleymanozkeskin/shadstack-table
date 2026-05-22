import { useId, useMemo, useRef } from 'react';
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { SST_AggregationFns } from '../fns/aggregationFns';
import { SST_FilterFns } from '../fns/filterFns';
import { SST_SortingFns } from '../fns/sortingFns';
import { SST_Default_Icons } from '../icons';
import { SST_Localization_EN } from '../locales/en';
import { type SST_DefinedTableOptions, type SST_RowData, type SST_TableOptions } from '../types';
import { getSST_Theme } from '../utils/style.utils';

export const SST_DefaultColumn = {
  filterVariant: 'text',
  maxSize: 1000,
  minSize: 40,
  size: 180,
} as const;

export const SST_DefaultDisplayColumn = {
  columnDefType: 'display',
  enableClickToCopy: false,
  enableColumnActions: false,
  enableColumnDragging: false,
  enableColumnFilter: false,
  enableColumnOrdering: false,
  enableEditing: false,
  enableGlobalFilter: false,
  enableGrouping: false,
  enableHiding: false,
  enableResizing: false,
  enableSorting: false,
} as const;

export const useSST_TableOptions: <TData extends SST_RowData>(
  tableOptions: SST_TableOptions<TData>,
) => SST_DefinedTableOptions<TData> = <TData extends SST_RowData>({
  aggregationFns,
  autoResetExpanded = false,
  columnFilterDisplayMode = 'subheader',
  columnResizeDirection,
  columnResizeMode = 'onChange',
  createDisplayMode = 'modal',
  defaultColumn,
  defaultDisplayColumn,
  editDisplayMode = 'modal',
  enableBatchRowSelection = true,
  enableBottomToolbar = true,
  enableColumnActions = true,
  enableColumnFilters = true,
  enableColumnOrdering = false,
  enableColumnPinning = false,
  enableColumnResizing = false,
  enableColumnVirtualization,
  enableDensityToggle = true,
  enableExpandAll = true,
  enableExpanding,
  enableFacetedValues = false,
  enableFilterMatchHighlighting = true,
  enableFilters = true,
  enableFullScreenToggle = true,
  enableGlobalFilter = true,
  enableGlobalFilterRankedResults = true,
  enableGrouping = false,
  enableHiding = true,
  enableKeyboardShortcuts = true,
  enableMultiRowSelection = true,
  enableMultiSort = true,
  enablePagination = true,
  enableRowPinning = false,
  enableRowSelection = false,
  enableRowVirtualization,
  enableSelectAll = true,
  enableSorting = true,
  enableStickyHeader = false,
  enableTableFooter = true,
  enableTableHead = true,
  enableToolbarInternalActions = true,
  enableTopToolbar = true,
  filterFns,
  icons,
  id,
  layoutMode,
  localization,
  manualFiltering,
  manualGrouping,
  manualPagination,
  manualSorting,
  mrtTheme,
  theme,
  paginationDisplayMode = 'default',
  positionActionsColumn = 'first',
  positionCreatingRow = 'top',
  positionExpandColumn = 'first',
  positionGlobalFilter = 'right',
  positionPagination = 'bottom',
  positionToolbarAlertBanner = 'top',
  positionToolbarDropZone = 'top',
  rowNumberDisplayMode = 'static',
  rowPinningDisplayMode = 'sticky',
  selectAllMode = 'page',
  sortingFns,
  ...rest
}: SST_TableOptions<TData>) => {
  const generatedId = useId();
  id = id ?? generatedId;
  icons = useMemo(() => ({ ...SST_Default_Icons, ...icons }), [icons]);
  localization = useMemo(
    () => ({
      ...SST_Localization_EN,
      ...localization,
    }),
    [localization],
  );
  // `theme` is the canonical input; `mrtTheme` remains as a deprecated alias.
  // The normalized options expose the resolved value on BOTH fields (same
  // reference) so legacy components reading `options.mrtTheme.<color>` keep
  // working.
  const resolvedTheme = useMemo(() => getSST_Theme(theme ?? mrtTheme), [theme, mrtTheme]);
  //Merge consumer-provided fn maps with built-ins. Previously these
  //memoized with `[]` and a stable identity, which froze consumer
  //overrides at the first render. Including the consumer input in the
  //dep list lets later renders see updated overrides while still
  //skipping the merge when nothing changed.
  aggregationFns = useMemo(() => ({ ...SST_AggregationFns, ...aggregationFns }), [aggregationFns]);
  filterFns = useMemo(() => ({ ...SST_FilterFns, ...filterFns }), [filterFns]);
  sortingFns = useMemo(() => ({ ...SST_SortingFns, ...sortingFns }), [sortingFns]);
  defaultColumn = useMemo(() => ({ ...SST_DefaultColumn, ...defaultColumn }), [defaultColumn]);
  defaultDisplayColumn = useMemo(
    () => ({
      ...SST_DefaultDisplayColumn,
      ...defaultDisplayColumn,
    }),
    [defaultDisplayColumn],
  );
  //Virtualization mode is captured at mount and intentionally cannot
  //change afterwards: TanStack Virtual measures DOM nodes in layout
  //effects and switching between virtualized/non-virtualized rendering
  //mid-life breaks ref-based measurement (and would require unmounting
  //the table body entirely). We pin the boolean to its first-render
  //value via a ref so the empty dep array isn't load-bearing for
  //correctness.
  const virtualizationModeRef = useRef<{ col: boolean | undefined; row: boolean | undefined }>({
    col: enableColumnVirtualization,
    row: enableRowVirtualization,
  });
  enableColumnVirtualization = virtualizationModeRef.current.col;
  enableRowVirtualization = virtualizationModeRef.current.row;

  if (!columnResizeDirection) {
    // TODO: theme-aware styling moved to CSS vars in _ui/styles.css
    columnResizeDirection =
      typeof document !== 'undefined' && document.dir === 'rtl' ? 'rtl' : 'ltr';
  }

  layoutMode = layoutMode || (enableColumnResizing ? 'grid-no-grow' : 'semantic');
  if (layoutMode === 'semantic' && (enableRowVirtualization || enableColumnVirtualization)) {
    layoutMode = 'grid';
  }

  if (enableRowVirtualization) {
    enableStickyHeader = true;
  }

  if (enablePagination === false && manualPagination === undefined) {
    manualPagination = true;
  }

  if (!rest.data?.length) {
    manualFiltering = true;
    manualGrouping = true;
    manualPagination = true;
    manualSorting = true;
  }

  return {
    aggregationFns,
    autoResetExpanded,
    columnFilterDisplayMode,
    columnResizeDirection,
    columnResizeMode,
    createDisplayMode,
    defaultColumn,
    defaultDisplayColumn,
    editDisplayMode,
    enableBatchRowSelection,
    enableBottomToolbar,
    enableColumnActions,
    enableColumnFilters,
    enableColumnOrdering,
    enableColumnPinning,
    enableColumnResizing,
    enableColumnVirtualization,
    enableDensityToggle,
    enableExpandAll,
    enableExpanding,
    enableFacetedValues,
    enableFilterMatchHighlighting,
    enableFilters,
    enableFullScreenToggle,
    enableGlobalFilter,
    enableGlobalFilterRankedResults,
    enableGrouping,
    enableHiding,
    enableKeyboardShortcuts,
    enableMultiRowSelection,
    enableMultiSort,
    enablePagination,
    enableRowPinning,
    enableRowSelection,
    enableRowVirtualization,
    enableSelectAll,
    enableSorting,
    enableStickyHeader,
    enableTableFooter,
    enableTableHead,
    enableToolbarInternalActions,
    enableTopToolbar,
    filterFns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: enableExpanding || enableGrouping ? getExpandedRowModel() : undefined,
    getFacetedMinMaxValues: enableFacetedValues ? getFacetedMinMaxValues() : undefined,
    getFacetedRowModel: enableFacetedValues ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: enableFacetedValues ? getFacetedUniqueValues() : undefined,
    getFilteredRowModel:
      (enableColumnFilters || enableGlobalFilter || enableFilters) && !manualFiltering
        ? getFilteredRowModel()
        : undefined,
    getGroupedRowModel: enableGrouping && !manualGrouping ? getGroupedRowModel() : undefined,
    getPaginationRowModel:
      enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting && !manualSorting ? getSortedRowModel() : undefined,
    getSubRows: (row) => row?.subRows,
    icons,
    id,
    layoutMode,
    localization,
    manualFiltering,
    manualGrouping,
    manualPagination,
    manualSorting,
    theme: resolvedTheme,
    mrtTheme: resolvedTheme,
    paginationDisplayMode,
    positionActionsColumn,
    positionCreatingRow,
    positionExpandColumn,
    positionGlobalFilter,
    positionPagination,
    positionToolbarAlertBanner,
    positionToolbarDropZone,
    rowNumberDisplayMode,
    rowPinningDisplayMode,
    selectAllMode,
    sortingFns,
    ...rest,
  } as SST_DefinedTableOptions<TData>;
};
