import { type ReactNode, type RefObject } from 'react';
import { type DeepKeys, type OnChangeFn, type TableOptions } from '@tanstack/react-table';
import { type VirtualizerOptions } from '@tanstack/react-virtual';
import { type SST_Cell } from './cell';
import {
  type SST_Column,
  type SST_ColumnDef,
  type SST_DisplayColumnDef,
  type SST_DisplayColumnIds,
} from './column';
import { type SST_FilterOption, type SST_InternalFilterOption } from './fns';
import { type SST_Icons } from './icons';
import { type SST_TableInstance } from './instance';
import { type SST_Localization } from './localization';
import { type LiteralUnion, type SST_DensityState } from './primitives';
import { type SST_Row, type SST_RowData } from './row';
import { type SST_TableSlotProps } from './slots';
import { type SST_TableState } from './state';
import { type SST_Theme } from './theme';
import { type SST_ColumnVirtualizer, type SST_RowVirtualizer } from './virtualization';

export type SST_DefinedTableOptions<TData extends SST_RowData> = Omit<
  SST_TableOptions<TData>,
  'icons' | 'localization' | 'mrtTheme' | 'theme'
> & {
  icons: SST_Icons;
  localization: SST_Localization;
  theme: Required<SST_Theme>;
  /**
   * @deprecated Read `options.theme` instead. Same reference as `theme`; kept
   * so legacy components reading `options.mrtTheme.<color>` continue to work.
   */
  mrtTheme: Required<SST_Theme>;
};

export type SST_StatefulTableOptions<TData extends SST_RowData> = SST_DefinedTableOptions<TData> & {
  state: Pick<
    SST_TableState<TData>,
    | 'columnFilterFns'
    | 'columnOrder'
    | 'columnSizingInfo'
    | 'creatingRow'
    | 'density'
    | 'draggingColumn'
    | 'draggingRow'
    | 'editingCell'
    | 'editingRow'
    | 'globalFilterFn'
    | 'grouping'
    | 'hoveredColumn'
    | 'hoveredRow'
    | 'isFullScreen'
    | 'pagination'
    | 'showAlertBanner'
    | 'showColumnFilters'
    | 'showGlobalFilter'
    | 'showToolbarDropZone'
  >;
};

/**
 * `columns` and `data` props are the only required props, but there are over 170 other optional props.
 *
 * See more info on creating columns and data:
 * @link https://suleymanozkeskin.github.io/shadstack-table/getting-started/
 *
 * Full props list (table options):
 * @link https://suleymanozkeskin.github.io/shadstack-table/api/props/
 */
export interface SST_TableOptions<TData extends SST_RowData> extends Omit<
  Partial<TableOptions<TData>>,
  | 'columns'
  | 'data'
  | 'defaultColumn'
  | 'enableRowSelection'
  | 'expandRowsFn'
  | 'getRowId'
  | 'globalFilterFn'
  | 'initialState'
  | 'onStateChange'
  | 'state'
> {
  columnFilterDisplayMode?: 'custom' | 'popover' | 'subheader';
  columnFilterModeOptions?: Array<LiteralUnion<string & SST_FilterOption>> | null;
  /**
   * The columns to display in the table. `accessorKey`s or `accessorFn`s must match keys in the `data` table option.
   *
   * Guides for the two column kinds:
   * @link https://suleymanozkeskin.github.io/shadstack-table/guides/data-columns/
   * @link https://suleymanozkeskin.github.io/shadstack-table/guides/display-columns/
   *
   * Full column options reference:
   * @link https://suleymanozkeskin.github.io/shadstack-table/api/column-options/
   */
  columns: SST_ColumnDef<TData, any>[];
  columnVirtualizerInstanceRef?: RefObject<SST_ColumnVirtualizer | null>;
  columnVirtualizerOptions?:
    | ((props: {
        table: SST_TableInstance<TData>;
      }) => Partial<VirtualizerOptions<HTMLDivElement, HTMLTableCellElement>>)
    | Partial<VirtualizerOptions<HTMLDivElement, HTMLTableCellElement>>;
  createDisplayMode?: 'custom' | 'modal' | 'row';
  /**
   * Pass your data as an array of objects. Objects can theoretically be any shape, but it's best to keep them consistent.
   *
   * Usage guide:
   * @link https://suleymanozkeskin.github.io/shadstack-table/getting-started/
   */
  data: TData[];
  /**
   * Instead of specifying a bunch of the same options for each column, you can just change an option in the `defaultColumn` table option to change a default option for all columns.
   */
  defaultColumn?: Partial<SST_ColumnDef<TData>>;
  /**
   * Change the default options for display columns.
   */
  defaultDisplayColumn?: Partial<SST_DisplayColumnDef<TData>>;
  displayColumnDefOptions?: Partial<{
    [key in SST_DisplayColumnIds]: Partial<SST_DisplayColumnDef<TData>>;
  }>;
  editDisplayMode?: 'cell' | 'custom' | 'modal' | 'row' | 'table';
  enableBatchRowSelection?: boolean;
  enableBottomToolbar?: boolean;
  enableCellActions?: ((cell: SST_Cell<TData>) => boolean) | boolean;
  enableClickToCopy?:
    | 'context-menu'
    | ((cell: SST_Cell<TData>) => 'context-menu' | boolean)
    | boolean;
  enableColumnActions?: boolean;
  enableColumnDragging?: boolean;
  enableColumnFilterModes?: boolean;
  enableColumnOrdering?: boolean;
  enableColumnVirtualization?: boolean;
  enableDensityToggle?: boolean;
  enableEditing?: ((row: SST_Row<TData>) => boolean) | boolean;
  enableExpandAll?: boolean;
  enableFacetedValues?: boolean;
  enableFilterMatchHighlighting?: boolean;
  enableFullScreenToggle?: boolean;
  enableGlobalFilterModes?: boolean;
  enableGlobalFilterRankedResults?: boolean;
  enableKeyboardShortcuts?: boolean;
  enablePagination?: boolean;
  enableRowActions?: boolean;
  enableRowDragging?: boolean;
  enableRowNumbers?: boolean;
  enableRowOrdering?: boolean;
  enableRowSelection?: ((row: SST_Row<TData>) => boolean) | boolean;
  enableRowVirtualization?: boolean;
  enableSelectAll?: boolean;
  enableStickyFooter?: boolean;
  enableStickyHeader?: boolean;
  enableTableFooter?: boolean;
  enableTableHead?: boolean;
  enableToolbarInternalActions?: boolean;
  enableTopToolbar?: boolean;
  expandRowsFn?: (dataRow: TData) => TData[];
  getRowId?: (originalRow: TData, index: number, parentRow: SST_Row<TData>) => string;
  globalFilterFn?: SST_FilterOption;
  globalFilterModeOptions?: SST_FilterOption[] | null;
  icons?: Partial<SST_Icons>;
  id?: string;
  initialState?: Partial<SST_TableState<TData>>;
  /**
   * Changes which kind of CSS layout is used to render the table. `semantic` uses default semantic HTML elements, while `grid` adds CSS grid and flexbox styles
   */
  layoutMode?: 'grid' | 'grid-no-grow' | 'semantic';
  /**
   * Pass in either a locale imported from `shadstack-table/locales/*` or a custom locale object.
   *
   * Localization (i18n) guide:
   * @link https://suleymanozkeskin.github.io/shadstack-table/guides/localization/
   */
  localization?: Partial<SST_Localization>;
  /**
   * Memoize cells, rows, or the entire table body to potentially improve render performance.
   *
   * @warning This will break some dynamic rendering features. See the memoization guide:
   * @link https://suleymanozkeskin.github.io/shadstack-table/guides/memoize-components/
   */
  memoMode?: 'cells' | 'rows';
  /**
   * Override the colors used for selected/pinned-row backgrounds, the drag/drop
   * border, the cell-navigation focus ring, the global-filter match highlight,
   * and a handful of other table-scoped pieces. Pass an object (or a function
   * returning one) — unspecified keys fall back to the shadcn-neutral defaults.
   */
  // TODO: theme-aware styling moved to CSS vars in _ui/styles.css
  theme?: ((theme: unknown) => Partial<SST_Theme>) | Partial<SST_Theme>;
  /**
   * @deprecated Use `theme` instead. This MRT-era alias is kept for migration
   * compatibility and will be removed in a future major.
   */
  mrtTheme?: ((theme: unknown) => Partial<SST_Theme>) | Partial<SST_Theme>;
  slotProps?: SST_TableSlotProps<TData>;
  onActionCellChange?: OnChangeFn<SST_Cell<TData> | null>;
  onColumnFilterFnsChange?: OnChangeFn<{ [key: string]: SST_FilterOption }>;
  onCreatingRowCancel?: (props: { row: SST_Row<TData>; table: SST_TableInstance<TData> }) => void;
  onCreatingRowChange?: OnChangeFn<SST_Row<TData> | null>;
  onCreatingRowSave?: (props: {
    exitCreatingMode: () => void;
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
    values: Record<LiteralUnion<string & DeepKeys<TData>>, any>;
  }) => Promise<void> | void;
  onDensityChange?: OnChangeFn<SST_DensityState>;
  onDraggingColumnChange?: OnChangeFn<SST_Column<TData> | null>;
  onDraggingRowChange?: OnChangeFn<SST_Row<TData> | null>;
  onEditingCellChange?: OnChangeFn<SST_Cell<TData> | null>;
  onEditingRowCancel?: (props: { row: SST_Row<TData>; table: SST_TableInstance<TData> }) => void;
  onEditingRowChange?: OnChangeFn<SST_Row<TData> | null>;
  onEditingRowSave?: (props: {
    exitEditingMode: () => void;
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
    values: Record<LiteralUnion<string & DeepKeys<TData>>, any>;
  }) => Promise<void> | void;
  onGlobalFilterFnChange?: OnChangeFn<SST_FilterOption>;
  onHoveredColumnChange?: OnChangeFn<Partial<SST_Column<TData>> | null>;
  onHoveredRowChange?: OnChangeFn<Partial<SST_Row<TData>> | null>;
  onIsFullScreenChange?: OnChangeFn<boolean>;
  onShowAlertBannerChange?: OnChangeFn<boolean>;
  onShowColumnFiltersChange?: OnChangeFn<boolean>;
  onShowGlobalFilterChange?: OnChangeFn<boolean>;
  onShowToolbarDropZoneChange?: OnChangeFn<boolean>;
  paginationDisplayMode?: 'custom' | 'default' | 'pages';
  positionActionsColumn?: 'first' | 'last';
  positionCreatingRow?: 'bottom' | 'top' | number;
  positionExpandColumn?: 'first' | 'last';
  positionGlobalFilter?: 'left' | 'none' | 'right';
  positionPagination?: 'both' | 'bottom' | 'none' | 'top';
  positionToolbarAlertBanner?: 'bottom' | 'head-overlay' | 'none' | 'top';
  positionToolbarDropZone?: 'both' | 'bottom' | 'none' | 'top';
  renderBottomToolbar?: ((props: { table: SST_TableInstance<TData> }) => ReactNode) | ReactNode;
  renderBottomToolbarCustomActions?: (props: { table: SST_TableInstance<TData> }) => ReactNode;
  renderCaption?: ((props: { table: SST_TableInstance<TData> }) => ReactNode) | ReactNode;
  renderCellActionMenuItems?: (props: {
    cell: SST_Cell<TData>;
    closeMenu: () => void;
    column: SST_Column<TData>;
    internalMenuItems: ReactNode[];
    row: SST_Row<TData>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
    table: SST_TableInstance<TData>;
  }) => ReactNode[];
  renderColumnActionsMenuItems?: (props: {
    closeMenu: () => void;
    column: SST_Column<TData>;
    internalColumnMenuItems: ReactNode[];
    table: SST_TableInstance<TData>;
  }) => ReactNode[];
  renderColumnFilterModeMenuItems?: (props: {
    column: SST_Column<TData>;
    internalFilterOptions: SST_InternalFilterOption[];
    onSelectFilterMode: (filterMode: SST_FilterOption) => void;
    table: SST_TableInstance<TData>;
  }) => ReactNode[];
  renderCreateRowDialogContent?: (props: {
    internalEditComponents: ReactNode[];
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  renderDetailPanel?: (props: {
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  renderEditRowDialogContent?: (props: {
    internalEditComponents: ReactNode[];
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  renderEmptyRowsFallback?: (props: { table: SST_TableInstance<TData> }) => ReactNode;
  renderGlobalFilterModeMenuItems?: (props: {
    internalFilterOptions: SST_InternalFilterOption[];
    onSelectFilterMode: (filterMode: SST_FilterOption) => void;
    table: SST_TableInstance<TData>;
  }) => ReactNode[];
  renderRowActionMenuItems?: (props: {
    closeMenu: () => void;
    row: SST_Row<TData>;
    staticRowIndex?: number;
    table: SST_TableInstance<TData>;
  }) => ReactNode[] | undefined;
  renderRowActions?: (props: {
    cell: SST_Cell<TData>;
    row: SST_Row<TData>;
    staticRowIndex?: number;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  renderToolbarAlertBannerContent?: (props: {
    groupedAlert: ReactNode | null;
    selectedAlert: ReactNode | null;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  renderToolbarInternalActions?: (props: { table: SST_TableInstance<TData> }) => ReactNode;
  renderTopToolbar?: ((props: { table: SST_TableInstance<TData> }) => ReactNode) | ReactNode;
  renderTopToolbarCustomActions?: (props: { table: SST_TableInstance<TData> }) => ReactNode;
  rowNumberDisplayMode?: 'original' | 'static';
  rowPinningDisplayMode?:
    | 'bottom'
    | 'select-bottom'
    | 'select-sticky'
    | 'select-top'
    | 'sticky'
    | 'top'
    | 'top-and-bottom';
  rowVirtualizerInstanceRef?: RefObject<SST_RowVirtualizer | null>;
  rowVirtualizerOptions?:
    | ((props: {
        table: SST_TableInstance<TData>;
      }) => Partial<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>>)
    | Partial<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>>;
  selectAllMode?: 'all' | 'page';
  /**
   * Manage state externally any way you want, then pass it back into MRT.
   */
  state?: Partial<SST_TableState<TData>>;
}
