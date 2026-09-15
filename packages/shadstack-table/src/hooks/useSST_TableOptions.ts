import { useId, useMemo, useState } from 'react';
import { createSST_features } from '../features';
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
  aggregationFns: aggregationFnsInput,
  autoResetExpanded = false,
  columnFilterDisplayMode = 'subheader',
  columnResizeDirection,
  columnResizeMode = 'onChange',
  createDisplayMode = 'modal',
  defaultColumn: defaultColumnInput,
  defaultDisplayColumn: defaultDisplayColumnInput,
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
  enableFilterByColumnMenuItem = true,
  enableFilterMatchHighlighting = true,
  enableFilterModeMenuDividers = true,
  enableFilters = true,
  enableFullScreenToggle = true,
  enableGlobalFilter = true,
  enableGlobalFilterRankedResults = true,
  enableGlobalFilterToggle = true,
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
  filterFns: filterFnsInput,
  icons: iconsInput,
  id,
  layoutMode,
  localization: localizationInput,
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
  sortFns: sortFnsInput,
  ...rest
}: SST_TableOptions<TData>): SST_DefinedTableOptions<TData> => {
  const generatedId = useId();
  id = id ?? generatedId;
  const icons = useMemo(() => ({ ...SST_Default_Icons, ...iconsInput }), [iconsInput]);

  const localization = useMemo(
    () => ({
      ...SST_Localization_EN,
      ...localizationInput,
    }),
    [localizationInput],
  );

  // `theme` is the canonical input; `mrtTheme` remains as a deprecated alias.
  // The normalized options expose the resolved value on BOTH fields (same
  // reference) so legacy components reading `options.mrtTheme.<color>` keep
  // working.
  const resolvedTheme = useMemo(() => getSST_Theme(theme ?? mrtTheme), [theme, mrtTheme]);

  //Merge consumer-provided fn maps with built-ins, keeping the consumer input
  //in the dep list so the merge re-runs when an override changes.
  //
  //How far a later change actually reaches differs under TanStack v9.
  //`constructTable` destructures these registries out of `options.features`
  //once and stores them on the table; nothing re-syncs that copy. `filterFn`
  //and `sortFn` still pick up late additions because `prepareColumns` resolves
  //those names against the live map before the column def reaches TanStack.
  //Anything resolved by TanStack itself — `aggregationFn: '<name>'`, and the
  //`'auto'` defaults — reads the frozen copy, so an entry added after the first
  //render will not resolve there.
  const aggregationFns = useMemo(
    () => ({ ...SST_AggregationFns, ...aggregationFnsInput }),
    [aggregationFnsInput],
  );

  const filterFns = useMemo(() => ({ ...SST_FilterFns, ...filterFnsInput }), [filterFnsInput]);
  const sortFns = useMemo(() => ({ ...SST_SortingFns, ...sortFnsInput }), [sortFnsInput]);

  const defaultColumn = useMemo(
    () => ({ ...SST_DefaultColumn, ...defaultColumnInput }),
    [defaultColumnInput],
  );

  const defaultDisplayColumn = useMemo(
    () => ({
      ...SST_DefaultDisplayColumn,
      ...defaultDisplayColumnInput,
    }),
    [defaultDisplayColumnInput],
  );

  //Virtualization mode is captured at mount and intentionally cannot
  //change afterwards: TanStack Virtual measures DOM nodes in layout
  //effects and switching between virtualized/non-virtualized rendering
  //mid-life breaks ref-based measurement (and would require unmounting
  //the table body entirely). We pin the boolean to its first-render
  //value in initial React state.
  const [virtualizationMode] = useState(() => ({
    column: !!enableColumnVirtualization,
    row: !!enableRowVirtualization,
  }));

  enableColumnVirtualization = virtualizationMode.column;
  enableRowVirtualization = virtualizationMode.row;

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

  //An `on*Change` key that is PRESENT but undefined would override the
  //feature-supplied default state updater in TanStack's options merge, and
  //`setStateSlice` treats a missing handler as "do nothing" — silently
  //freezing that slice. Consumers spreading partially-built option objects
  //hit this, so strip explicit-undefined handler keys before they reach the
  //table.
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('on') && key.endsWith('Change') && value === undefined) {
      if (!Reflect.deleteProperty(rest, key)) {
        throw new Error(
          `Cannot remove undefined table option ${key}: the copied property is not configurable.`,
        );
      }
    }
  }

  //TanStack v9 registers row models as feature-set slots rather than
  //`get*RowModel` table options, so the enable flags that used to decide
  //whether to pass a factory now decide whether to register the slot. The
  //conditions are unchanged from v8.
  const features = useMemo(
    () =>
      createSST_features({
        aggregationFns,
        enabledRowModels: {
          expandedRowModel: !!(enableExpanding || enableGrouping),
          facetedMinMaxValues: enableFacetedValues,
          facetedRowModel: enableFacetedValues,
          facetedUniqueValues: enableFacetedValues,
          filteredRowModel:
            (enableColumnFilters || enableGlobalFilter || enableFilters) && !manualFiltering,
          groupedRowModel: enableGrouping && !manualGrouping,
          paginatedRowModel: enablePagination && !manualPagination,
          sortedRowModel: enableSorting && !manualSorting,
        },
        filterFns,
        sortFns,
      }),
    [
      aggregationFns,
      enableColumnFilters,
      enableExpanding,
      enableFacetedValues,
      enableFilters,
      enableGlobalFilter,
      enableGrouping,
      enablePagination,
      enableSorting,
      filterFns,
      manualFiltering,
      manualGrouping,
      manualPagination,
      manualSorting,
      sortFns,
    ],
  );

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
    enableFilterByColumnMenuItem,
    enableFilterMatchHighlighting,
    enableFilterModeMenuDividers,
    enableFilters,
    enableFullScreenToggle,
    enableGlobalFilter,
    enableGlobalFilterRankedResults,
    enableGlobalFilterToggle,
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
    features,
    filterFns,
    //TanStack v9 makes `row.toggleExpanded()` a no-op unless the row reports
    //`getCanExpand()`, whose default requires sub-rows. Detail panels attach to
    //rows that have none, so without this every detail-panel toggle would
    //silently do nothing. `SST_ExpandButton` already treats a detail panel as
    //making a row expandable; this states the same rule to the table.
    getRowCanExpand: rest.getRowCanExpand ?? (rest.renderDetailPanel ? () => true : undefined),
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
    sortFns,
    ...rest,
  };
};
