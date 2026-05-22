import { type ReactNode, type RefObject } from 'react';
import {
  type AccessorFn,
  type Column,
  type ColumnDef,
  type DeepKeys,
  type DeepValue,
  type Header,
  type HeaderGroup,
} from '@tanstack/react-table';
import { type SST_Cell } from './cell';
import {
  type SST_AggregationFn,
  type SST_FilterFn,
  type SST_FilterOption,
  type SST_InternalFilterOption,
  type SST_SortingFn,
} from './fns';
import { type DropdownOption, type LiteralUnion } from './primitives';
import { type SST_Row, type SST_RowData } from './row';
import { type SST_ColumnSlotProps } from './slots';
import { type SST_TableInstance } from './instance';

export type SST_DisplayColumnIds =
  | 'sst-row-actions'
  | 'sst-row-drag'
  | 'sst-row-expand'
  | 'sst-row-numbers'
  | 'sst-row-pin'
  | 'sst-row-select'
  | 'sst-row-spacer';

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
  slotProps?: SST_ColumnSlotProps<TData, TValue>;
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
