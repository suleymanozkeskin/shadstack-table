import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from 'react';
import {
  type AccessorFn,
  type AggregationFn,
  type Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingInfoState,
  type ColumnSizingState,
  type DeepKeys,
  type DeepValue,
  type ExpandedState,
  type FilterFn,
  type GroupingState,
  type Header,
  type HeaderGroup,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingFn,
  type SortingState,
  type Table,
  type TableOptions,
  type TableState,
  type Updater,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  type VirtualItem,
  type Virtualizer,
  type VirtualizerOptions,
} from '@tanstack/react-virtual';
import type * as React from 'react';
import type { Alert } from './_ui/alert';
import type { Badge } from './_ui/badge';
import type { Button } from './_ui/button';
import type { Checkbox } from './_ui/checkbox';
import type { DialogContent } from './_ui/dialog';
import type { Input } from './_ui/input';
import type { Pagination } from './_ui/pagination';
import type { Progress } from './_ui/progress';
import type { Skeleton } from './_ui/skeleton';
import type { Slider } from './_ui/slider';
import type { Spinner } from './_ui/spinner';
import { type SST_AggregationFns } from './fns/aggregationFns';
import { type SST_FilterFns } from './fns/filterFns';
import { type SST_SortingFns } from './fns/sortingFns';
import { type SST_Icons } from './icons';

export type { SST_Icons };
export type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;

export type Xor<A, B> =
  | Prettify<A & { [k in keyof B]?: never }>
  | Prettify<B & { [k in keyof A]?: never }>;

export type DropdownOption =
  | {
      label?: string;
      value: any;
    }
  | string;

export type SST_DensityState = 'comfortable' | 'compact' | 'spacious';

export type SST_ColumnFilterFnsState = Record<string, SST_FilterOption>;

export type SST_RowData = Record<string, any>;

export type SST_ColumnFiltersState = ColumnFiltersState;
export type SST_ColumnOrderState = ColumnOrderState;
export type SST_ColumnPinningState = ColumnPinningState;
export type SST_ColumnSizingInfoState = ColumnSizingInfoState;
export type SST_ColumnSizingState = ColumnSizingState;
export type SST_ExpandedState = ExpandedState;
export type SST_GroupingState = GroupingState;
export type SST_PaginationState = PaginationState;
export type SST_RowSelectionState = RowSelectionState;
export type SST_SortingState = SortingState;
export type SST_Updater<T> = Updater<T>;
export type SST_VirtualItem = VirtualItem;
export type SST_VisibilityState = VisibilityState;

export type SST_VirtualizerOptions<
  TScrollElement extends Element | Window = Element | Window,
  TItemElement extends Element = Element,
> = VirtualizerOptions<TScrollElement, TItemElement>;

export type SST_ColumnVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableCellElement,
> = Virtualizer<TScrollElement, TItemElement> & {
  virtualColumns: SST_VirtualItem[];
  virtualPaddingLeft?: number;
  virtualPaddingRight?: number;
};

export type SST_RowVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableRowElement,
> = Virtualizer<TScrollElement, TItemElement> & {
  virtualRows: SST_VirtualItem[];
};

export type SST_ColumnHelper<TData extends SST_RowData> = {
  accessor: <
    TAccessor extends AccessorFn<TData> | DeepKeys<TData>,
    TValue extends TAccessor extends AccessorFn<TData, infer TReturn>
      ? TReturn
      : TAccessor extends DeepKeys<TData>
        ? DeepValue<TData, TAccessor>
        : never,
  >(
    accessor: TAccessor,
    column: SST_DisplayColumnDef<TData, TValue>,
  ) => SST_ColumnDef<TData, TValue>;
  display: (column: SST_DisplayColumnDef<TData>) => SST_ColumnDef<TData>;
  group: (column: SST_GroupColumnDef<TData>) => SST_ColumnDef<TData>;
};

export interface SST_Localization {
  // language of the localization as BCP 47 language tag for number formatting
  language: string;
  actions: string;
  and: string;
  cancel: string;
  changeFilterMode: string;
  changeSearchMode: string;
  clearFilter: string;
  clearSearch: string;
  clearSelection: string;
  clearSort: string;
  clickToCopy: string;
  collapse: string;
  collapseAll: string;
  columnActions: string;
  copiedToClipboard: string;
  copy: string;
  dropToGroupBy: string;
  edit: string;
  expand: string;
  expandAll: string;
  filterArrIncludes: string;
  filterArrIncludesAll: string;
  filterArrIncludesSome: string;
  filterBetween: string;
  filterBetweenInclusive: string;
  filterByColumn: string;
  filterContains: string;
  filterEmpty: string;
  filterEndsWith: string;
  filterEquals: string;
  filterEqualsString: string;
  filterFuzzy: string;
  filterGreaterThan: string;
  filterGreaterThanOrEqualTo: string;
  filterIncludesString: string;
  filterIncludesStringSensitive: string;
  filteringByColumn: string;
  filterInNumberRange: string;
  filterLessThan: string;
  filterLessThanOrEqualTo: string;
  filterMode: string;
  filterNotEmpty: string;
  filterNotEquals: string;
  filterStartsWith: string;
  filterWeakEquals: string;
  goToFirstPage: string;
  goToLastPage: string;
  goToNextPage: string;
  goToPreviousPage: string;
  grab: string;
  groupByColumn: string;
  groupedBy: string;
  hideAll: string;
  hideColumn: string;
  max: string;
  min: string;
  move: string;
  noRecordsToDisplay: string;
  noResultsFound: string;
  of: string;
  or: string;
  pin: string;
  pinToLeft: string;
  pinToRight: string;
  resetColumnSize: string;
  resetOrder: string;
  rowActions: string;
  rowNumber: string;
  rowNumbers: string;
  rowsPerPage: string;
  save: string;
  search: string;
  select: string;
  selectedCountOfRowCountRowsSelected: string;
  showAll: string;
  showAllColumns: string;
  showHideColumns: string;
  showHideFilters: string;
  showHideSearch: string;
  sortByColumnAsc: string;
  sortByColumnDesc: string;
  sortedByColumnAsc: string;
  sortedByColumnDesc: string;
  thenBy: string;
  toggleDensity: string;
  toggleFullScreen: string;
  toggleSelectAll: string;
  toggleSelectRow: string;
  toggleVisibility: string;
  ungroupByColumn: string;
  unpin: string;
  unpinAll: string;
}

export interface SST_Theme {
  baseBackgroundColor: string;
  cellNavigationOutlineColor: string;
  draggingBorderColor: string;
  matchHighlightColor: string;
  menuBackgroundColor: string;
  pinnedRowBackgroundColor: string;
  selectedRowBackgroundColor: string;
}

export interface SST_RowModel<TData extends SST_RowData> {
  flatRows: SST_Row<TData>[];
  rows: SST_Row<TData>[];
  rowsById: { [key: string]: SST_Row<TData> };
}

export type SST_TableInstance<TData extends SST_RowData> = Omit<
  Table<TData>,
  | 'getAllColumns'
  | 'getAllFlatColumns'
  | 'getAllLeafColumns'
  | 'getBottomRows'
  | 'getCenterLeafColumns'
  | 'getCenterRows'
  | 'getColumn'
  | 'getExpandedRowModel'
  | 'getFlatHeaders'
  | 'getFooterGroups'
  | 'getHeaderGroups'
  | 'getLeafHeaders'
  | 'getLeftLeafColumns'
  | 'getPaginationRowModel'
  | 'getPreFilteredRowModel'
  | 'getPrePaginationRowModel'
  | 'getRightLeafColumns'
  | 'getRowModel'
  | 'getSelectedRowModel'
  | 'getState'
  | 'getTopRows'
  | 'options'
> & {
  getAllColumns: () => SST_Column<TData>[];
  getAllFlatColumns: () => SST_Column<TData>[];
  getAllLeafColumns: () => SST_Column<TData>[];
  getBottomRows: () => SST_Row<TData>[];
  getCenterLeafColumns: () => SST_Column<TData>[];
  getCenterRows: () => SST_Row<TData>[];
  getColumn: (columnId: string) => SST_Column<TData>;
  getExpandedRowModel: () => SST_RowModel<TData>;
  getFlatHeaders: () => SST_Header<TData>[];
  getFooterGroups: () => SST_HeaderGroup<TData>[];
  getHeaderGroups: () => SST_HeaderGroup<TData>[];
  getLeafHeaders: () => SST_Header<TData>[];
  getLeftLeafColumns: () => SST_Column<TData>[];
  getPaginationRowModel: () => SST_RowModel<TData>;
  getPreFilteredRowModel: () => SST_RowModel<TData>;
  getPrePaginationRowModel: () => SST_RowModel<TData>;
  getRightLeafColumns: () => SST_Column<TData>[];
  getRowModel: () => SST_RowModel<TData>;
  getSelectedRowModel: () => SST_RowModel<TData>;
  getState: () => SST_TableState<TData>;
  getTopRows: () => SST_Row<TData>[];
  options: SST_StatefulTableOptions<TData>;
  refs: {
    actionCellRef: RefObject<HTMLTableCellElement | null>;
    bottomToolbarRef: RefObject<HTMLDivElement | null>;
    editInputRefs: RefObject<Record<string, HTMLInputElement> | null>;
    filterInputRefs: RefObject<Record<string, HTMLInputElement> | null>;
    lastSelectedRowId: RefObject<null | string>;
    searchInputRef: RefObject<HTMLInputElement | null>;
    tableContainerRef: RefObject<HTMLDivElement | null>;
    tableFooterRef: RefObject<HTMLTableSectionElement | null>;
    tableHeadCellRefs: RefObject<Record<string, HTMLTableCellElement> | null>;
    tableHeadRef: RefObject<HTMLTableSectionElement | null>;
    tablePaperRef: RefObject<HTMLDivElement | null>;
    topToolbarRef: RefObject<HTMLDivElement | null>;
  };
  setActionCell: Dispatch<SetStateAction<SST_Cell<TData> | null>>;
  setColumnFilterFns: Dispatch<SetStateAction<SST_ColumnFilterFnsState>>;
  setCreatingRow: Dispatch<SetStateAction<SST_Row<TData> | null | true>>;
  setDensity: Dispatch<SetStateAction<SST_DensityState>>;
  setDraggingColumn: Dispatch<SetStateAction<SST_Column<TData> | null>>;
  setDraggingRow: Dispatch<SetStateAction<SST_Row<TData> | null>>;
  setEditingCell: Dispatch<SetStateAction<SST_Cell<TData> | null>>;
  setEditingRow: Dispatch<SetStateAction<SST_Row<TData> | null>>;
  setGlobalFilterFn: Dispatch<SetStateAction<SST_FilterOption>>;
  setHoveredColumn: Dispatch<SetStateAction<Partial<SST_Column<TData>> | null>>;
  setHoveredRow: Dispatch<SetStateAction<Partial<SST_Row<TData>> | null>>;
  setIsFullScreen: Dispatch<SetStateAction<boolean>>;
  setShowAlertBanner: Dispatch<SetStateAction<boolean>>;
  setShowColumnFilters: Dispatch<SetStateAction<boolean>>;
  setShowGlobalFilter: Dispatch<SetStateAction<boolean>>;
  setShowToolbarDropZone: Dispatch<SetStateAction<boolean>>;
};

export type SST_DefinedTableOptions<TData extends SST_RowData> = Omit<
  SST_TableOptions<TData>,
  'icons' | 'localization' | 'mrtTheme'
> & {
  icons: SST_Icons;
  localization: SST_Localization;
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

export interface SST_TableState<TData extends SST_RowData> extends TableState {
  actionCell?: SST_Cell<TData> | null;
  columnFilterFns: SST_ColumnFilterFnsState;
  creatingRow: SST_Row<TData> | null;
  density: SST_DensityState;
  draggingColumn: SST_Column<TData> | null;
  draggingRow: SST_Row<TData> | null;
  editingCell: SST_Cell<TData> | null;
  editingRow: SST_Row<TData> | null;
  globalFilterFn: SST_FilterOption;
  hoveredColumn: Partial<SST_Column<TData>> | null;
  hoveredRow: Partial<SST_Row<TData>> | null;
  isFullScreen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  showAlertBanner: boolean;
  showColumnFilters: boolean;
  showGlobalFilter: boolean;
  showLoadingOverlay: boolean;
  showProgressBars: boolean;
  showSkeletons: boolean;
  showToolbarDropZone: boolean;
}

export interface SST_ColumnDef<TData extends SST_RowData, TValue = unknown> extends Omit<
  ColumnDef<TData, TValue>,
  | 'accessorKey'
  | 'aggregatedCell'
  | 'aggregationFn'
  | 'cell'
  | 'columns'
  | 'filterFn'
  | 'footer'
  | 'header'
  | 'id'
  | 'sortingFn'
> {
  /**
   * Either an `accessorKey` or a combination of an `accessorFn` and `id` are required for a data column definition.
   * Specify a function here to point to the correct property in the data object.
   *
   * @example accessorFn: (row) => row.username
   */
  accessorFn?: (originalRow: TData) => TValue;
  /**
   * Either an `accessorKey` or a combination of an `accessorFn` and `id` are required for a data column definition.
   * Specify which key in the row this column should use to access the correct data.
   * Also supports Deep Key Dot Notation.
   *
   * @example accessorKey: 'username' //simple
   * @example accessorKey: 'name.firstName' //deep key dot notation
   */
  accessorKey?: DeepKeys<TData> | (string & {});
  AggregatedCell?: (props: {
    cell: SST_Cell<TData, TValue>;
    column: SST_Column<TData, TValue>;
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
  }) => ReactNode;
  aggregationFn?: Array<SST_AggregationFn<TData>> | SST_AggregationFn<TData>;
  Cell?: (props: {
    cell: SST_Cell<TData, TValue>;
    column: SST_Column<TData, TValue>;
    renderedCellValue: ReactNode;
    row: SST_Row<TData>;
    rowRef?: RefObject<HTMLTableRowElement | null>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  /**
   * Specify what type of column this is. Either `data`, `display`, or `group`. Defaults to `data`.
   * Leave this blank if you are just creating a normal data column.
   *
   * @default 'data'
   *
   * @example columnDefType: 'display'
   */
  columnDefType?: 'data' | 'display' | 'group';
  columnFilterModeOptions?: Array<LiteralUnion<string & SST_FilterOption>> | null;
  columns?: SST_ColumnDef<TData, TValue>[];
  Edit?: (props: {
    cell: SST_Cell<TData, TValue>;
    column: SST_Column<TData, TValue>;
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  editSelectOptions?:
    | ((props: {
        cell: SST_Cell<TData, TValue>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => DropdownOption[])
    | DropdownOption[];
  editVariant?: 'select' | 'text';
  enableClickToCopy?:
    | 'context-menu'
    | ((cell: SST_Cell<TData>) => 'context-menu' | boolean)
    | boolean;
  enableColumnActions?: boolean;
  enableColumnDragging?: boolean;
  enableColumnFilterModes?: boolean;
  enableColumnOrdering?: boolean;
  enableEditing?: ((row: SST_Row<TData>) => boolean) | boolean;
  enableFilterMatchHighlighting?: boolean;
  Filter?: (props: {
    column: SST_Column<TData, TValue>;
    header: SST_Header<TData>;
    rangeFilterIndex?: number;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
  filterFn?: SST_FilterFn<TData>;
  filterSelectOptions?: DropdownOption[];
  filterVariant?:
    | 'autocomplete'
    | 'checkbox'
    | 'date'
    | 'date-range'
    | 'datetime'
    | 'datetime-range'
    | 'multi-select'
    | 'range'
    | 'range-slider'
    | 'select'
    | 'text'
    | 'time'
    | 'time-range';
  /**
   * footer must be a string. If you want custom JSX to render the footer, you can also specify a `Footer` option. (Capital F)
   */
  footer?: string;
  Footer?:
    | ((props: {
        column: SST_Column<TData, TValue>;
        footer: SST_Header<TData>;
        table: SST_TableInstance<TData>;
      }) => ReactNode)
    | ReactNode;
  GroupedCell?: (props: {
    cell: SST_Cell<TData, TValue>;
    column: SST_Column<TData, TValue>;
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
  }) => ReactNode;
  /**
   * If `layoutMode` is `'grid'` or `'grid-no-grow'`, you can specify the flex grow value for individual columns to still grow and take up remaining space, or set to `false`/0 to not grow.
   */
  grow?: boolean | number;
  /**
   * header must be a string. If you want custom JSX to render the header, you can also specify a `Header` option. (Capital H)
   */
  header: string;
  Header?:
    | ((props: {
        column: SST_Column<TData, TValue>;
        header: SST_Header<TData>;
        table: SST_TableInstance<TData>;
      }) => ReactNode)
    | ReactNode;
  /**
   * Either an `accessorKey` or a combination of an `accessorFn` and `id` are required for a data column definition.
   *
   * If you have also specified an `accessorFn`, MRT still needs to have a valid `id` to be able to identify the column uniquely.
   *
   * `id` defaults to the `accessorKey` or `header` if not specified.
   *
   * @default gets set to the same value as `accessorKey` by default
   */
  id?: LiteralUnion<string & keyof TData>;
  slotProps?: {
    columnActionsButton?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    columnDragHandle?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    copyButton?:
      | ((props: {
          cell: SST_Cell<TData, TValue>;
          column: SST_Column<TData>;
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    editInput?:
      | ((props: {
          cell: SST_Cell<TData, TValue>;
          column: SST_Column<TData>;
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Input>)
      | React.ComponentProps<typeof Input>;
    filterAutocomplete?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Input>)
      | React.ComponentProps<typeof Input>;
    filterCheckbox?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Checkbox>)
      | React.ComponentProps<typeof Checkbox>;
    filterDatePicker?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'input'>)
      | React.ComponentProps<'input'>;
    filterDateTimePicker?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'input'>)
      | React.ComponentProps<'input'>;
    filterInput?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Input>)
      | React.ComponentProps<typeof Input>;
    filterSlider?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Slider>)
      | React.ComponentProps<typeof Slider>;
    filterTimePicker?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'input'>)
      | React.ComponentProps<'input'>;
    tableBodyCell?:
      | ((props: {
          cell: SST_Cell<TData, TValue>;
          column: SST_Column<TData>;
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'td'>)
      | React.ComponentProps<'td'>;
    tableFooterCell?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'td'>)
      | React.ComponentProps<'td'>;
    tableHeadCell?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'th'>)
      | React.ComponentProps<'th'>;
  };
  PlaceholderCell?: (props: {
    cell: SST_Cell<TData, TValue>;
    column: SST_Column<TData, TValue>;
    row: SST_Row<TData>;
    table: SST_TableInstance<TData>;
  }) => ReactNode;
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
  sortingFn?: SST_SortingFn<TData>;
  visibleInShowHideMenu?: boolean;
}

export type SST_DisplayColumnDef<TData extends SST_RowData, TValue = unknown> = Omit<
  SST_ColumnDef<TData, TValue>,
  'accessorFn' | 'accessorKey'
>;

export type SST_GroupColumnDef<TData extends SST_RowData> = SST_DisplayColumnDef<TData, any> & {
  columns: SST_ColumnDef<TData>[];
};

export type SST_DefinedColumnDef<TData extends SST_RowData, TValue = unknown> = Omit<
  SST_ColumnDef<TData, TValue>,
  'defaultDisplayColumn' | 'id'
> & {
  _filterFn: SST_FilterOption;
  defaultDisplayColumn: Partial<SST_ColumnDef<TData, TValue>>;
  id: string;
};

export type SST_Column<TData extends SST_RowData, TValue = unknown> = Omit<
  Column<TData, TValue>,
  'columnDef' | 'columns' | 'filterFn' | 'footer' | 'header'
> & {
  columnDef: SST_DefinedColumnDef<TData, TValue>;
  columns?: SST_Column<TData, TValue>[];
  filterFn?: SST_FilterFn<TData>;
  footer: string;
  header: string;
};

export type SST_Header<TData extends SST_RowData> = Omit<Header<TData, unknown>, 'column'> & {
  column: SST_Column<TData>;
};

export type SST_HeaderGroup<TData extends SST_RowData> = Omit<HeaderGroup<TData>, 'headers'> & {
  headers: SST_Header<TData>[];
};

export type SST_Row<TData extends SST_RowData> = Omit<
  Row<TData>,
  | '_valuesCache'
  | 'getAllCells'
  | 'getParentRow'
  | 'getParentRows'
  | 'getRow'
  | 'getVisibleCells'
  | 'subRows'
> & {
  _valuesCache: Record<LiteralUnion<string & DeepKeys<TData>>, any>;
  getAllCells: () => SST_Cell<TData>[];
  getParentRow: () => SST_Row<TData> | null;
  getParentRows: () => SST_Row<TData>[];
  getRow: () => SST_Row<TData>;
  getVisibleCells: () => SST_Cell<TData>[];
  subRows?: SST_Row<TData>[];
};

export type SST_Cell<TData extends SST_RowData, TValue = unknown> = Omit<
  Cell<TData, TValue>,
  'column' | 'row'
> & {
  column: SST_Column<TData, TValue>;
  row: SST_Row<TData>;
};

export type SST_AggregationOption = string & keyof typeof SST_AggregationFns;

export type SST_AggregationFn<TData extends SST_RowData> =
  | AggregationFn<TData>
  | SST_AggregationOption;

export type SST_SortingOption = LiteralUnion<string & keyof typeof SST_SortingFns>;

export type SST_SortingFn<TData extends SST_RowData> = SST_SortingOption | SortingFn<TData>;

export type SST_FilterOption = LiteralUnion<string & keyof typeof SST_FilterFns>;

export type SST_FilterFn<TData extends SST_RowData> = FilterFn<TData> | SST_FilterOption;

export type SST_InternalFilterOption = {
  divider: boolean;
  label: string;
  option: string;
  symbol: string;
};

export type SST_DisplayColumnIds =
  | 'sst-row-actions'
  | 'sst-row-drag'
  | 'sst-row-expand'
  | 'sst-row-numbers'
  | 'sst-row-pin'
  | 'sst-row-select'
  | 'sst-row-spacer';

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
  memoMode?: 'cells' | 'rows' | 'table-body';
  // TODO: theme-aware styling moved to CSS vars in _ui/styles.css
  mrtTheme?: ((theme: unknown) => Partial<SST_Theme>) | Partial<SST_Theme>;
  slotProps?: {
    bottomToolbar?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
      | React.ComponentProps<'div'>;
    columnActionsButton?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    columnDragHandle?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    copyButton?:
      | ((props: {
          cell: SST_Cell<TData>;
          column: SST_Column<TData>;
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    createRowDialog?:
      | ((props: {
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof DialogContent>)
      | React.ComponentProps<typeof DialogContent>;
    detailPanel?:
      | ((props: {
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'div'>)
      | React.ComponentProps<'div'>;
    editInput?:
      | ((props: {
          cell: SST_Cell<TData>;
          column: SST_Column<TData>;
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Input>)
      | React.ComponentProps<typeof Input>;
    editRowDialog?:
      | ((props: {
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof DialogContent>)
      | React.ComponentProps<typeof DialogContent>;
    expandAllButton?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    expandButton?:
      | ((props: {
          row: SST_Row<TData>;
          staticRowIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    filterAutocomplete?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Input>)
      | React.ComponentProps<typeof Input>;
    filterCheckbox?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Checkbox>)
      | React.ComponentProps<typeof Checkbox>;
    filterDatePicker?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'input'>)
      | React.ComponentProps<'input'>;
    filterDateTimePicker?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'input'>)
      | React.ComponentProps<'input'>;
    filterInput?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Input>)
      | React.ComponentProps<typeof Input>;
    filterSlider?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Slider>)
      | React.ComponentProps<typeof Slider>;
    filterTimePicker?:
      | ((props: {
          column: SST_Column<TData>;
          rangeFilterIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'input'>)
      | React.ComponentProps<'input'>;
    linearProgress?:
      | ((props: {
          isTopToolbar: boolean;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Progress>)
      | React.ComponentProps<typeof Progress>;
    pagination?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Pagination> & {
          disabled?: boolean;
          rowsPerPageOptions?: { label: string; value: number }[] | number[];
          showRowsPerPage?: boolean;
        })
      | (React.ComponentProps<typeof Pagination> & {
          disabled?: boolean;
          rowsPerPageOptions?: { label: string; value: number }[] | number[];
          showRowsPerPage?: boolean;
        });
    rowDragHandle?:
      | ((props: {
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Button>)
      | React.ComponentProps<typeof Button>;
    searchInput?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Input>)
      | React.ComponentProps<typeof Input>;
    selectAllCheckbox?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Checkbox>)
      | React.ComponentProps<typeof Checkbox>;
    selectCheckbox?:
      | ((props: {
          row: SST_Row<TData>;
          staticRowIndex?: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Checkbox>)
      | React.ComponentProps<typeof Checkbox>;
    skeleton?:
      | ((props: {
          cell: SST_Cell<TData>;
          column: SST_Column<TData>;
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<typeof Skeleton>)
      | React.ComponentProps<typeof Skeleton>;
    spinner?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Spinner>)
      | React.ComponentProps<typeof Spinner>;
    table?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'table'>)
      | React.ComponentProps<'table'>;
    tableBody?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'tbody'>)
      | React.ComponentProps<'tbody'>;
    tableBodyCell?:
      | ((props: {
          cell: SST_Cell<TData>;
          column: SST_Column<TData>;
          row: SST_Row<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'td'>)
      | React.ComponentProps<'td'>;
    tableBodyRow?:
      | ((props: {
          isDetailPanel?: boolean;
          row: SST_Row<TData>;
          staticRowIndex: number;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'tr'>)
      | React.ComponentProps<'tr'>;
    tableContainer?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
      | React.ComponentProps<'div'>;
    tableFooter?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'tfoot'>)
      | React.ComponentProps<'tfoot'>;
    tableFooterCell?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'td'>)
      | React.ComponentProps<'td'>;
    tableFooterRow?:
      | ((props: {
          footerGroup: SST_HeaderGroup<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'tr'>)
      | React.ComponentProps<'tr'>;
    tableHead?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'thead'>)
      | React.ComponentProps<'thead'>;
    tableHeadCell?:
      | ((props: {
          column: SST_Column<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'th'>)
      | React.ComponentProps<'th'>;
    tableHeadRow?:
      | ((props: {
          headerGroup: SST_HeaderGroup<TData>;
          table: SST_TableInstance<TData>;
        }) => React.ComponentProps<'tr'>)
      | React.ComponentProps<'tr'>;
    tablePaper?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
      | React.ComponentProps<'div'>;
    toolbarAlertBanner?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Alert>)
      | React.ComponentProps<typeof Alert>;
    toolbarAlertBannerChip?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Badge>)
      | React.ComponentProps<typeof Badge>;
    topToolbar?:
      | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
      | React.ComponentProps<'div'>;
  };
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
