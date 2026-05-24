// shadstack-table — shadcn-native React data table.
// Full data-table feature surface on TanStack Table v8 + TanStack Virtual + shadcn/ui primitives. Zero MUI dependency.
//
// API stability tiers (Stable / Deprecated / Internal-unstable) are documented in
// the package README's "API stability" section. Everything in this barrel is
// currently exported for ergonomic access, but only the Stable tier is covered
// by semver — Internal pieces can move or disappear without a major bump.

// The CSS bundle is shipped as a fallback theme: tokens are declared with
// `:where(:root)` / `:where(.dark)` (specificity 0,0,0) so any host
// `:root { --background: ... }` declaration always wins. Consumers with their
// own design system (tweakcn presets, custom shadcn install, etc.) override
// these defaults transparently. Consumers who don't ship CSS at all still get
// a usable shadcn theme out of the box.
// oxlint-disable-next-line no-unassigned-import -- CSS bundle is a side-effect import
import './_ui/styles.css';

export * from './types';

//helpers
export * from './utils/tanstack.helpers';
export * from './utils/cell.utils';
export * from './utils/column.utils';
export * from './utils/displayColumn.utils';
export * from './utils/experimental_getReusableCoreRowModel';
export * from './utils/row.utils';

//fns
export * from './fns/aggregationFns';
export * from './fns/filterFns';
export * from './fns/sortingFns';

//hooks
export * from './hooks/useShadStackTable';
export * from './hooks/useSST_ColumnVirtualizer';
export * from './hooks/useSST_Effects';
export * from './hooks/useSST_RowVirtualizer';
export * from './hooks/useSST_Rows';
export * from './hooks/useSST_TableInstance';
export * from './hooks/useSST_TableOptions';

//components
export * from './components/ShadStackTable';
//body components
export * from './components/body/SST_TableBody';
export * from './components/body/SST_TableBodyCell';
export * from './components/body/SST_TableBodyCellValue';
export * from './components/body/SST_TableBodyRow';
export * from './components/body/SST_TableBodyRowGrabHandle';
export * from './components/body/SST_TableBodyRowPinButton';
export * from './components/body/SST_TableDetailPanel';
//button components
export * from './components/buttons/SST_ColumnPinningButtons';
export * from './components/buttons/SST_CopyButton';
export * from './components/buttons/SST_EditActionButtons';
export * from './components/buttons/SST_ExpandAllButton';
export * from './components/buttons/SST_ExpandButton';
export * from './components/buttons/SST_GrabHandleButton';
export * from './components/buttons/SST_RowPinButton';
export * from './components/buttons/SST_ShowHideColumnsButton';
export * from './components/buttons/SST_ToggleDensePaddingButton';
export * from './components/buttons/SST_ToggleFiltersButton';
export * from './components/buttons/SST_ToggleFullScreenButton';
export * from './components/buttons/SST_ToggleGlobalFilterButton';
export * from './components/buttons/SST_ToggleRowActionMenuButton';
//footer components
export * from './components/footer/SST_TableFooter';
export * from './components/footer/SST_TableFooterCell';
export * from './components/footer/SST_TableFooterRow';
//head components
export * from './components/head/SST_TableHead';
export * from './components/head/SST_TableHeadCell';
export * from './components/head/SST_TableHeadCellColumnActionsButton';
export * from './components/head/SST_TableHeadCellFilterContainer';
export * from './components/head/SST_TableHeadCellFilterLabel';
export * from './components/head/SST_TableHeadCellGrabHandle';
export * from './components/head/SST_TableHeadCellResizeHandle';
export * from './components/head/SST_TableHeadCellSortLabel';
export * from './components/head/SST_TableHeadRow';
//input components
export * from './components/inputs/SST_EditCellTextField';
export * from './components/inputs/SST_FilterCheckbox';
export * from './components/inputs/SST_FilterRangeFields';
export * from './components/inputs/SST_FilterRangePopover';
export * from './components/inputs/SST_FilterRangeSlider';
export * from './components/inputs/SST_FilterTextField';
export * from './components/inputs/SST_GlobalFilterTextField';
export * from './components/inputs/SST_SelectCheckbox';
//menu components
export * from './components/menus/SST_ActionMenuItem';
export * from './components/menus/SST_ColumnActionMenu';
export * from './components/menus/SST_FilterOptionMenu';
export * from './components/menus/SST_RowActionMenu';
export * from './components/menus/SST_ShowHideColumnsMenu';
export * from './components/menus/SST_ShowHideColumnsMenuItems';
//modal components
export * from './components/modals/SST_EditRowModal';
//table components
export * from './components/table/SST_Table';
export * from './components/table/SST_TableContainer';
export * from './components/table/SST_TableLoadingOverlay';
export * from './components/table/SST_TablePaper';
//toolbar components
export * from './components/toolbar/SST_BottomToolbar';
export * from './components/toolbar/SST_LinearProgressBar';
export * from './components/toolbar/SST_TablePagination';
export * from './components/toolbar/SST_ToolbarAlertBanner';
export * from './components/toolbar/SST_ToolbarDropZone';
export * from './components/toolbar/SST_ToolbarInternalButtons';
export * from './components/toolbar/SST_TopToolbar';

// Replaced at build time by Vite's `define` with the package.json version.
// oxlint-disable-next-line no-underscore-dangle -- compile-time substitution sentinel
declare const __SST_VERSION__: string;
// oxlint-disable-next-line no-underscore-dangle -- compile-time substitution sentinel
export const VERSION: string = typeof __SST_VERSION__ === 'string' ? __SST_VERSION__ : '0.0.0';

export type ShadstackTableMarker = typeof VERSION;
