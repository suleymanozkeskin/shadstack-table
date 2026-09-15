import { type SST_TableOptions, type SST_RowData } from './types';
import { type RankingInfo } from '@tanstack/match-sorter-utils';
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type TableFeature,
} from '@tanstack/react-table';
import { SST_AggregationFns } from './fns/aggregationFns';
import { SST_FilterFns } from './fns/filterFns';
import { SST_SortingFns } from './fns/sortingFns';

/**
 * Default values for every shadstack-owned state slice.
 *
 * Registered through {@link shadstackCoreFeature}'s `getInitialState`, which
 * makes each key part of `table.initialState` — and `constructTable`
 * manufactures a writable base atom, a derived readonly atom, and a
 * `table.store` snapshot key for every `initialState` key. That is what makes
 * the shadstack slices subscribable through the exact same machinery as
 * TanStack's own (`table.atoms.density`, `table.Subscribe`, the `useTable`
 * selector), with the same `options.atoms[key]` > `options.state[key]` >
 * `baseAtoms[key]` precedence for consumer-controlled slices.
 */
export const SST_STATE_DEFAULTS = {
  actionCell: null,
  columnFilterFns: {},
  creatingRow: null,
  density: 'comfortable',
  draggingColumn: null,
  draggingRow: null,
  editingCell: null,
  editingRow: null,
  globalFilterFn: 'fuzzy',
  hoveredColumn: null,
  hoveredRow: null,
  isFullScreen: false,
  isLoading: false,
  isSaving: false,
  showAlertBanner: false,
  showColumnFilters: false,
  showGlobalFilter: false,
  //tri-state flags: `undefined` means "auto" (follow isLoading/isSaving),
  //`false` means the consumer explicitly disabled the affordance. Seeding
  //`false` here would read as an explicit opt-out and suppress the loading
  //overlay, progress bars, and skeletons in their auto modes. The keys are
  //still present (explicitly undefined) so their atoms are created.
  showLoadingOverlay: undefined,
  showProgressBars: undefined,
  showSkeletons: undefined,
  showToolbarDropZone: false,
} as const;

/** Seeds custom state so TanStack creates its base and derived atoms. */
const shadstackCoreFeature: TableFeature = {
  getInitialState: (state) => ({ ...SST_STATE_DEFAULTS, ...state }),
};

/**
 * The TanStack feature set every shadstack table is built on.
 *
 * shadstack-table exposes the full data-table surface, so the feature set is
 * fixed here once rather than composed per table. Pinning it in one place is
 * what keeps `TFeatures` out of the public API: every `SST_*` type stays
 * single-generic (`SST_Row<TData>`, `SST_TableInstance<TData>`, …) even though
 * the underlying TanStack types now take `<TFeatures, TData>`.
 *
 * The `filterFns` / `sortFns` / `aggregationFns` slots are also what make the
 * string identifiers on column definitions resolve — `filterFn: 'fuzzy'` is
 * valid because `fuzzy` is a key of {@link SST_FilterFns} registered here.
 *
 * `cellSpanningFeature` and `cellSelectionFeature` are deliberately not
 * registered: no shadstack code path calls either feature's APIs, and
 * registering a feature is not free — it adds a state slice, an atom and a
 * store-snapshot key to every table, installs its prototype methods, arms its
 * `autoReset*` hook on data changes, and pulls the feature into consumer
 * bundles (TanStack is external to this package's build, so the cost lands
 * downstream and is not covered by our own size budgets).
 */
const SST_stockFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  // Row models. The core row model is created automatically in v9 and has no slot.
  expandedRowModel: createExpandedRowModel(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  groupedRowModel: createGroupedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  // Function registries, replacing the v8 top-level `filterFns` / `sortingFns`
  // / `aggregationFns` table options.
  aggregationFns: SST_AggregationFns,
  filterFns: SST_FilterFns,
  sortFns: SST_SortingFns,
  // Type-only slot: the payload our `fuzzy` filter hands to `addMeta`, which
  // the `fuzzy` sorting function reads back off `row.columnFiltersMeta`.
  // SAFETY: TanStack removes this type-only slot before constructing runtime features.
  filterMeta: {} as RankingInfo,
});

/** Adds custom state defaults without global TanStack declaration merging. */
export const SST_features = {
  ...SST_stockFeatures,
  shadstackCoreFeature,
};

export type SST_Features = Omit<typeof SST_features, SST_RowModelSlot> &
  Partial<Pick<typeof SST_features, SST_RowModelSlot>>;

/** Row-model slots that {@link createSST_features} can switch off. */
type SST_RowModelSlot =
  | 'expandedRowModel'
  | 'facetedMinMaxValues'
  | 'facetedRowModel'
  | 'facetedUniqueValues'
  | 'filteredRowModel'
  | 'groupedRowModel'
  | 'paginatedRowModel'
  | 'sortedRowModel';

const rowModelSlots = [
  'expandedRowModel',
  'facetedMinMaxValues',
  'facetedRowModel',
  'facetedUniqueValues',
  'filteredRowModel',
  'groupedRowModel',
  'paginatedRowModel',
  'sortedRowModel',
] as const satisfies readonly SST_RowModelSlot[];

/**
 * Builds the feature set backing one table.
 *
 * Two things vary per table, so the feature set cannot simply be the module
 * constant:
 *
 * - **Row models are conditional.** Under v8 a disabled feature meant omitting
 *   its `get*RowModel` option, which left those rows unprocessed. The v9
 *   equivalent is omitting the row-model slot, so the enable flags are applied
 *   here.
 * - **Consumers can extend the function registries** through the `filterFns`,
 *   `sortFns` and `aggregationFns` table options, which v9 moved off table
 *   options and into the feature set.
 *
 * The return type stays {@link SST_Features} regardless of which slots were
 * dropped. That matches v8, where the table type always carried every method
 * and only runtime behavior depended on the row models actually supplied.
 */
export const createSST_features = <TData extends SST_RowData>({
  aggregationFns,
  enabledRowModels,
  filterFns,
  sortFns,
}: {
  aggregationFns?: SST_TableOptions<TData>['aggregationFns'];
  enabledRowModels: Record<SST_RowModelSlot, boolean>;
  filterFns?: SST_TableOptions<TData>['filterFns'];
  sortFns?: SST_TableOptions<TData>['sortFns'];
}): SST_Features => {
  const features: SST_Features = { ...SST_features };

  for (const slot of rowModelSlots) {
    if (!enabledRowModels[slot]) delete features[slot];
  }

  if (aggregationFns) features.aggregationFns = { ...features.aggregationFns, ...aggregationFns };

  if (filterFns) features.filterFns = { ...features.filterFns, ...filterFns };

  if (sortFns) features.sortFns = { ...features.sortFns, ...sortFns };

  return features;
};
