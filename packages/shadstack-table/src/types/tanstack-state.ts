import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type columnResizingState,
} from '@tanstack/react-table';

export type SST_ColumnFiltersState = ColumnFiltersState;
export type SST_ColumnOrderState = ColumnOrderState;
/**
 * Pinned columns are keyed by logical region in TanStack v9: `{ start, end }`,
 * not `{ left, right }`. Persisted state from earlier versions needs migrating.
 */
export type SST_ColumnPinningState = ColumnPinningState;
export type SST_ColumnResizingState = columnResizingState;
/**
 * @deprecated Renamed to {@link SST_ColumnResizingState}. TanStack v9 split the
 * combined column-sizing feature into sizing and resizing, and renamed the
 * `columnSizingInfo` state slice to `columnResizing`.
 */
export type SST_ColumnSizingInfoState = columnResizingState;
export type SST_ColumnSizingState = ColumnSizingState;
export type SST_ExpandedState = ExpandedState;
export type SST_GroupingState = GroupingState;
export type SST_PaginationState = PaginationState;
export type SST_RowSelectionState = RowSelectionState;
export type SST_SortingState = SortingState;
export type SST_VisibilityState = ColumnVisibilityState;
