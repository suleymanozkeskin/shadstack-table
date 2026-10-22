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
 * The table options that switch a row-model stage on or off. Declared here
 * rather than picked from `SST_DefinedTableOptions`, which is itself typed
 * from {@link SST_Features}.
 */
type SST_RowModelStageOptions = {
  enableColumnFilters?: boolean;
  enableExpanding?: boolean;
  enableFilters?: boolean;
  enableGlobalFilter?: boolean;
  enableGrouping?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
};

/**
 * Wraps a row-model factory so the table's current options decide, on every
 * read, whether its stage runs.
 *
 * TanStack v9 keeps the `features` object passed at table construction and
 * drops every later one in `table_mergeOptions`. A row-model slot left out at
 * mount therefore never comes back — a table first rendered with no rows, or
 * with a stage disabled, would keep that stage off for its whole life. Every
 * stage is registered instead, and `isEnabled` applies the enable flags each
 * time the stage is read. The `manual*` flags are not checked here: TanStack
 * checks them itself on every read.
 *
 * - `isEnabled` receives the live table options.
 * - `passThrough` returns the stage's input unchanged, which is what TanStack
 *   returns for a stage with no slot.
 *
 * The wrapped factory runs once per table, on the stage's first read, as
 * TanStack's own factories do. The cast reads shadstack's keys off the options
 * TanStack holds: `useSST_TableInstance` passes the full
 * `SST_DefinedTableOptions` to `useTable`, whose types cannot know them.
 */
const gateRowModel =
  <TTable extends { options: object }, TRowModel>(
    createRowModel: (table: TTable) => () => TRowModel,
    {
      isEnabled,
      passThrough,
    }: {
      isEnabled: (options: SST_RowModelStageOptions) => boolean;
      passThrough: (table: TTable) => TRowModel;
    },
  ) =>
  (table: TTable): (() => TRowModel) => {
    const getStageRowModel = createRowModel(table);
    return () =>
      isEnabled(table.options as SST_RowModelStageOptions)
        ? getStageRowModel()
        : passThrough(table);
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
  // The pipeline stages are gated on the live options; see `gateRowModel`.
  expandedRowModel: gateRowModel(createExpandedRowModel(), {
    isEnabled: ({ enableExpanding, enableGrouping }) => !!(enableExpanding || enableGrouping),
    passThrough: (table) => table.getPreExpandedRowModel(),
  }),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: gateRowModel(createFilteredRowModel(), {
    isEnabled: ({ enableColumnFilters, enableFilters, enableGlobalFilter }) =>
      !!(enableColumnFilters || enableGlobalFilter || enableFilters),
    passThrough: (table) => table.getPreFilteredRowModel(),
  }),
  groupedRowModel: gateRowModel(createGroupedRowModel(), {
    isEnabled: ({ enableGrouping }) => !!enableGrouping,
    passThrough: (table) => table.getPreGroupedRowModel(),
  }),
  paginatedRowModel: gateRowModel(createPaginatedRowModel(), {
    isEnabled: ({ enablePagination }) => !!enablePagination,
    passThrough: (table) => table.getPrePaginatedRowModel(),
  }),
  sortedRowModel: gateRowModel(createSortedRowModel(), {
    isEnabled: ({ enableSorting }) => !!enableSorting,
    passThrough: (table) => table.getPreSortedRowModel(),
  }),
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

/** Faceted row-model slots, which {@link createSST_features} can switch off. */
const facetedRowModelSlots = [
  'facetedMinMaxValues',
  'facetedRowModel',
  'facetedUniqueValues',
] as const satisfies readonly (keyof SST_Features)[];

/**
 * Builds the feature set backing one table.
 *
 * Two things vary per table, so the feature set cannot simply be the module
 * constant:
 *
 * - **Faceted row models are conditional.** Filter inputs read faceted values
 *   on every column, so their slots are registered only when
 *   `enableFacetedValues` is on. TanStack keeps the feature set from table
 *   construction, so this flag takes effect at mount only. The pipeline
 *   stages are always registered and switch with the live options instead
 *   (see `gateRowModel`).
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
  enableFacetedValues,
  filterFns,
  sortFns,
}: {
  aggregationFns?: Record<string, unknown>;
  enableFacetedValues: boolean;
  filterFns?: Record<string, unknown>;
  sortFns?: Record<string, unknown>;
}): SST_Features => {
  const features: Record<string, unknown> = { ...SST_features };

  if (!enableFacetedValues) {
    for (const slot of facetedRowModelSlots) delete features[slot];
  }

  if (aggregationFns) features.aggregationFns = aggregationFns;
  if (filterFns) features.filterFns = filterFns;
  if (sortFns) features.sortFns = sortFns;

  return features as SST_Features;
};
