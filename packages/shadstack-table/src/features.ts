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
  makeStateUpdater,
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
import { createRow } from './utils/tanstack.helpers';

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

const onChangeKey = (sliceKey: string) =>
  `on${sliceKey.charAt(0).toUpperCase()}${sliceKey.slice(1)}Change`;

/**
 * The TanStack feature that owns shadstack's state slices.
 *
 * - `getInitialState` seeds every slice so its atoms exist (see
 *   {@link SST_STATE_DEFAULTS}); user-provided `initialState` values win.
 * - `getDefaultTableOptions` supplies a `makeStateUpdater` default for each
 *   `on<Slice>Change` option, so an uncontrolled slice writes its base atom. A
 *   consumer-provided handler replaces the default entirely — the same
 *   controlled-state contract as v8 and as TanStack's own slices.
 * - `constructTableAPIs` attaches the public setters. Each setter forwards the
 *   raw updater to the live `options.on<Slice>Change`, preserving the exact
 *   `options.onXChange ?? internalSetState` semantics the hook used to wire by
 *   hand: consumer handlers receive whatever the caller passed (value or
 *   function), not a wrapped updater.
 *
 * Upstream types `getInitialState`/`getDefaultTableOptions` over
 * `TableState_All`/`TableOptions_All`, which cannot know shadstack's keys, so
 * the casts below are the boundary between the two type worlds.
 */
const shadstackCoreFeature: TableFeature = {
  getInitialState: (state) => ({ ...SST_STATE_DEFAULTS, ...state }),
  getDefaultTableOptions: (table) =>
    Object.fromEntries(
      Object.keys(SST_STATE_DEFAULTS).map((sliceKey) => [
        onChangeKey(sliceKey),
        makeStateUpdater(sliceKey as never, table as never),
      ]),
    ),
  constructTableAPIs: (table) => {
    const options = () => table.options as Record<string, ((updater: unknown) => void) | undefined>;
    const setter = (sliceKey: string) => (updater: unknown) =>
      options()[onChangeKey(sliceKey)]?.(updater);
    const t = table as unknown as Record<string, unknown>;
    t.setActionCell = setter('actionCell');
    t.setColumnFilterFns = setter('columnFilterFns');
    t.setCreatingRow = (row: unknown) =>
      options().onCreatingRowChange?.(row === true ? createRow(table as never) : row);
    t.setDensity = setter('density');
    t.setDraggingColumn = setter('draggingColumn');
    t.setDraggingRow = setter('draggingRow');
    t.setEditingCell = setter('editingCell');
    t.setEditingRow = setter('editingRow');
    t.setGlobalFilterFn = setter('globalFilterFn');
    t.setHoveredColumn = setter('hoveredColumn');
    t.setHoveredRow = setter('hoveredRow');
    t.setIsFullScreen = setter('isFullScreen');
    t.setShowAlertBanner = setter('showAlertBanner');
    t.setShowColumnFilters = setter('showColumnFilters');
    t.setShowGlobalFilter = setter('showGlobalFilter');
    t.setShowToolbarDropZone = setter('showToolbarDropZone');
  },
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
  filterMeta: {} as RankingInfo,
});

/**
 * The stock feature set plus {@link shadstackCoreFeature}.
 *
 * The extra key is added with a local cast rather than a global
 * `Plugins`/`TableState_FeatureMap` declaration merge: this is a published
 * library, and a global merge would leak into every consumer's own TanStack
 * usage. The cast is sound — `TableState<SST_Features>` is derived only from
 * keys TanStack's feature maps know, so the extra key does not change any
 * derived type (verified by a type-equality assertion in the state-ownership
 * tests).
 */
export const SST_features = {
  ...SST_stockFeatures,
  shadstackCoreFeature,
} as typeof SST_stockFeatures & { shadstackCoreFeature: TableFeature };

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
