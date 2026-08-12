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
} from '@tanstack/react-table';
import { SST_AggregationFns } from './fns/aggregationFns';
import { SST_FilterFns } from './fns/filterFns';
import { SST_SortingFns } from './fns/sortingFns';

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
export const SST_features = tableFeatures({
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
  filterMeta: {} as RankingInfo,
});

export type SST_Features = typeof SST_features;

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
export const createSST_features = ({
  aggregationFns,
  enabledRowModels,
  filterFns,
  sortFns,
}: {
  aggregationFns?: Record<string, unknown>;
  enabledRowModels: Record<SST_RowModelSlot, boolean>;
  filterFns?: Record<string, unknown>;
  sortFns?: Record<string, unknown>;
}): SST_Features => {
  const features: Record<string, unknown> = { ...SST_features };

  for (const [slot, enabled] of Object.entries(enabledRowModels)) {
    if (!enabled) delete features[slot];
  }

  if (aggregationFns) features.aggregationFns = aggregationFns;
  if (filterFns) features.filterFns = filterFns;
  if (sortFns) features.sortFns = sortFns;

  return features as SST_Features;
};
