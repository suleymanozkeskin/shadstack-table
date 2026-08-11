/**
 * Stable identifiers for the built-in column-actions menu entries.
 *
 * Each entry rendered into `internalColumnMenuItems` carries one of these as
 * its React `key`, so a `renderColumnActionsMenuItems` override can address a
 * specific entry — filter it out, reorder around it, splice a custom item next
 * to it — without depending on its position in the array.
 *
 * Listed in render order rather than alphabetically, since that is the order
 * the items reach the callback in.
 *
 * Prefer the declarative options where they exist. Every entry here is already
 * suppressed by the feature flag that produces it (`enableSorting`,
 * `enableGrouping`, `enableColumnPinning`, `enableColumnResizing`,
 * `enableHiding`), and the filter entry has `enableFilterByColumnMenuItem`.
 * Taking the render slot to hide something opts you out of later improvements
 * to the entries you kept; these ids are for the cases the flags don't cover.
 */
export const SST_COLUMN_MENU_ITEM_IDS = {
  clearSort: 'sst-clear-sort',
  sortAsc: 'sst-sort-asc',
  sortDesc: 'sst-sort-desc',
  clearFilter: 'sst-clear-filter',
  filterByColumn: 'sst-filter-by-column',
  filterModeSubMenu: 'sst-filter-mode-submenu',
  groupByColumn: 'sst-group-by-column',
  pinToLeft: 'sst-pin-to-left',
  pinToRight: 'sst-pin-to-right',
  unpin: 'sst-unpin',
  resetColumnSize: 'sst-reset-column-size',
  hideColumn: 'sst-hide-column',
  showAllColumns: 'sst-show-all-columns',
} as const;

export type SST_ColumnMenuItemIds =
  (typeof SST_COLUMN_MENU_ITEM_IDS)[keyof typeof SST_COLUMN_MENU_ITEM_IDS];
