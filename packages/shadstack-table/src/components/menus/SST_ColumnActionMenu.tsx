import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { useSST_TableState } from '../../hooks/useSST_TableState';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { SST_ActionMenuItem } from './SST_ActionMenuItem';
import { SST_FilterOptionMenu } from './SST_FilterOptionMenu';
import { cn } from '../../lib/utils';
import { SST_COLUMN_MENU_ITEM_IDS } from '../../constants';
import {
  type SST_Header,
  type SST_InternalColumnMenuItem,
  type SST_RowData,
  type SST_TableInstance,
} from '../../types';

export interface SST_ColumnActionMenuProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof PopoverContent
> {
  anchorEl: HTMLElement | null;
  header: SST_Header<TData>;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  table: SST_TableInstance<TData>;
}

export const SST_ColumnActionMenu = <TData extends SST_RowData>({
  anchorEl,
  className,
  header,
  setAnchorEl,
  table,
  ...rest
}: SST_ColumnActionMenuProps<TData>) => {
  const {
    getAllLeafColumns,
    options: {
      columnFilterDisplayMode,
      columnFilterModeOptions,
      enableColumnFilterModes,
      enableColumnFilters,
      enableColumnPinning,
      enableColumnResizing,
      enableFilterByColumnMenuItem,
      enableGrouping,
      enableHiding,
      enableSorting,
      enableSortingRemoval,
      icons: {
        ClearAllIcon,
        DynamicFeedIcon,
        FilterListIcon,
        FilterListOffIcon,
        PushPinIcon,
        RestartAltIcon,
        SortIcon,
        ViewColumnIcon,
        VisibilityOffIcon,
      },
      localization,
      mrtTheme: { menuBackgroundColor },
      renderColumnActionsMenuItems,
    },
    refs: { filterInputRefs },
    setColumnFilterFns,
    setColumnOrder,
    setColumnResizing,
    setShowColumnFilters,
  } = table;
  const { column } = header;
  const { columnDef } = column;
  const { columnSizing, columnVisibility, density, showColumnFilters } = useSST_TableState(
    table,
    (s) => ({
      columnSizing: s.columnSizing,
      columnVisibility: s.columnVisibility,
      density: s.density,
      showColumnFilters: s.showColumnFilters,
      //menu entries render this column's sort/group/pin/filter state
      columnFilters: s.columnFilters,
      columnPinning: s.columnPinning,
      grouping: s.grouping,
      sorting: s.sorting,
    }),
  );
  const columnFilterValue = column.getFilterValue();
  const virtualRef = React.useMemo<React.RefObject<HTMLElement | null> | undefined>(
    () => (anchorEl ? { current: anchorEl } : undefined),
    [anchorEl],
  );

  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<HTMLElement | null>(null);

  const handleClearSort = () => {
    column.clearSorting();
    setAnchorEl(null);
  };

  const handleSortAsc = () => {
    column.toggleSorting(false);
    setAnchorEl(null);
  };

  const handleSortDesc = () => {
    column.toggleSorting(true);
    setAnchorEl(null);
  };

  const handleResetColumnSize = () => {
    setColumnResizing((old) => ({ ...old, isResizingColumn: false }));
    column.resetSize();
    setAnchorEl(null);
  };

  const handleHideColumn = () => {
    column.toggleVisibility(false);
    setAnchorEl(null);
  };

  const handlePinColumn = (pinDirection: 'start' | 'end' | false) => {
    column.pin(pinDirection);
    setAnchorEl(null);
  };

  const handleGroupByColumn = () => {
    column.toggleGrouping();
    setColumnOrder((old: any) => ['sst-row-expand', ...old]);
    setAnchorEl(null);
  };

  const handleClearFilter = () => {
    column.setFilterValue(undefined);
    setAnchorEl(null);
    // oxlint-disable-next-line no-underscore-dangle -- _filterFn is the canonical internal property carried over from upstream MRT/TanStack column def shape
    if (['empty', 'notEmpty'].includes(columnDef._filterFn)) {
      setColumnFilterFns((prev) => ({
        ...prev,
        [header.id]: allowedColumnFilterOptions?.[0] ?? 'fuzzy',
      }));
    }
  };

  const handleFilterByColumn = () => {
    setShowColumnFilters(true);
    queueMicrotask(() => filterInputRefs.current?.[`${column.id}-0`]?.focus());
    setAnchorEl(null);
  };

  const handleShowAllColumns = () => {
    for (const col of getAllLeafColumns()) {
      if (col.columnDef.enableHiding !== false) col.toggleVisibility(true);
    }
    setAnchorEl(null);
  };

  const handleOpenFilterModeMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setFilterMenuAnchorEl(event.currentTarget);
  };

  const isSelectFilter = !!columnDef.filterSelectOptions;

  const allowedColumnFilterOptions = columnDef?.columnFilterModeOptions ?? columnFilterModeOptions;

  const showFilterModeSubMenu =
    enableColumnFilterModes &&
    columnDef.enableColumnFilterModes !== false &&
    !isSelectFilter &&
    (allowedColumnFilterOptions === undefined || !!allowedColumnFilterOptions?.length);

  // "Filter by column" has no gate of its own upstream — it shares
  // `enableColumnFilters && column.getCanFilter()` with "clear filter" — so
  // this is the only way to drop one entry without the other. The filter-mode
  // submenu below is gated on the same value: this entry is its only anchor
  // (the per-column filter input mounts its own), and a submenu with no anchor
  // is an element nothing can open.
  const showFilterByColumnMenuItem =
    enableFilterByColumnMenuItem !== false &&
    columnDef.enableFilterByColumnMenuItem !== false &&
    columnFilterDisplayMode === 'subheader';

  const internalColumnMenuItems = [
    ...(enableSorting && column.getCanSort()
      ? [
          enableSortingRemoval !== false && (
            <SST_ActionMenuItem
              disabled={column.getIsSorted() === false}
              icon={<ClearAllIcon />}
              key={SST_COLUMN_MENU_ITEM_IDS.clearSort}
              label={localization.clearSort}
              onClick={handleClearSort}
              table={table}
            />
          ),
          <SST_ActionMenuItem
            disabled={column.getIsSorted() === 'asc'}
            icon={<SortIcon style={{ transform: 'rotate(180deg) scaleX(-1)' }} />}
            key={SST_COLUMN_MENU_ITEM_IDS.sortAsc}
            label={localization.sortByColumnAsc?.replace('{column}', String(columnDef.header))}
            onClick={handleSortAsc}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={column.getIsSorted() === 'desc'}
            divider={enableColumnFilters || enableGrouping || enableHiding}
            icon={<SortIcon />}
            key={SST_COLUMN_MENU_ITEM_IDS.sortDesc}
            label={localization.sortByColumnDesc?.replace('{column}', String(columnDef.header))}
            onClick={handleSortDesc}
            table={table}
          />,
        ]
      : []),
    ...(enableColumnFilters && column.getCanFilter()
      ? [
          <SST_ActionMenuItem
            disabled={
              !columnFilterValue ||
              (Array.isArray(columnFilterValue) &&
                !columnFilterValue.filter((value) => value).length)
            }
            icon={<FilterListOffIcon />}
            key={SST_COLUMN_MENU_ITEM_IDS.clearFilter}
            label={localization.clearFilter}
            onClick={handleClearFilter}
            table={table}
          />,
          showFilterByColumnMenuItem && (
            <SST_ActionMenuItem
              disabled={showColumnFilters && !enableColumnFilterModes}
              divider={enableGrouping || enableHiding}
              icon={<FilterListIcon />}
              key={SST_COLUMN_MENU_ITEM_IDS.filterByColumn}
              label={localization.filterByColumn?.replace('{column}', String(columnDef.header))}
              onClick={showColumnFilters ? handleOpenFilterModeMenu : handleFilterByColumn}
              onOpenSubMenu={showFilterModeSubMenu ? handleOpenFilterModeMenu : undefined}
              table={table}
            />
          ),
          showFilterByColumnMenuItem && showFilterModeSubMenu && (
            <SST_FilterOptionMenu
              anchorEl={filterMenuAnchorEl}
              header={header}
              key={SST_COLUMN_MENU_ITEM_IDS.filterModeSubMenu}
              onSelect={handleFilterByColumn}
              setAnchorEl={setFilterMenuAnchorEl}
              table={table}
            />
          ),
        ].filter(Boolean)
      : []),
    ...(enableGrouping && column.getCanGroup()
      ? [
          <SST_ActionMenuItem
            divider={enableColumnPinning}
            icon={<DynamicFeedIcon />}
            key={SST_COLUMN_MENU_ITEM_IDS.groupByColumn}
            label={localization[
              column.getIsGrouped() ? 'ungroupByColumn' : 'groupByColumn'
            ]?.replace('{column}', String(columnDef.header))}
            onClick={handleGroupByColumn}
            table={table}
          />,
        ]
      : []),
    ...(enableColumnPinning && column.getCanPin()
      ? [
          <SST_ActionMenuItem
            disabled={column.getIsPinned() === 'start' || !column.getCanPin()}
            icon={<PushPinIcon style={{ transform: 'rotate(90deg)' }} />}
            key={SST_COLUMN_MENU_ITEM_IDS.pinToLeft}
            label={localization.pinToLeft}
            onClick={() => handlePinColumn('start')}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={column.getIsPinned() === 'end' || !column.getCanPin()}
            icon={<PushPinIcon style={{ transform: 'rotate(-90deg)' }} />}
            key={SST_COLUMN_MENU_ITEM_IDS.pinToRight}
            label={localization.pinToRight}
            onClick={() => handlePinColumn('end')}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={!column.getIsPinned()}
            divider={enableHiding}
            icon={<PushPinIcon />}
            key={SST_COLUMN_MENU_ITEM_IDS.unpin}
            label={localization.unpin}
            onClick={() => handlePinColumn(false)}
            table={table}
          />,
        ]
      : []),
    ...(enableColumnResizing && column.getCanResize()
      ? [
          <SST_ActionMenuItem
            disabled={columnSizing[column.id] === undefined}
            icon={<RestartAltIcon />}
            key={SST_COLUMN_MENU_ITEM_IDS.resetColumnSize}
            label={localization.resetColumnSize}
            onClick={handleResetColumnSize}
            table={table}
          />,
        ]
      : []),
    ...(enableHiding
      ? [
          <SST_ActionMenuItem
            disabled={!column.getCanHide()}
            icon={<VisibilityOffIcon />}
            key={SST_COLUMN_MENU_ITEM_IDS.hideColumn}
            label={localization.hideColumn?.replace('{column}', String(columnDef.header))}
            onClick={handleHideColumn}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={!Object.values(columnVisibility).filter((visible) => !visible).length}
            icon={<ViewColumnIcon />}
            key={SST_COLUMN_MENU_ITEM_IDS.showAllColumns}
            label={localization.showAllColumns?.replace('{column}', String(columnDef.header))}
            onClick={handleShowAllColumns}
            table={table}
          />,
        ]
      : []),
  ].filter(Boolean) as SST_InternalColumnMenuItem[];

  return (
    <Popover
      open={!!anchorEl}
      onOpenChange={(open) => {
        if (!open) setAnchorEl(null);
      }}
    >
      {virtualRef && <PopoverAnchor virtualRef={virtualRef as any} />}
      <PopoverContent
        align="start"
        sideOffset={4}
        style={{ backgroundColor: menuBackgroundColor }}
        className={cn('w-auto min-w-[8rem] p-1', density === 'compact' && 'text-xs', className)}
        {...rest}
      >
        {columnDef.renderColumnActionsMenuItems?.({
          closeMenu: () => setAnchorEl(null),
          column,
          internalColumnMenuItems,
          table,
        }) ??
          renderColumnActionsMenuItems?.({
            closeMenu: () => setAnchorEl(null),
            column,
            internalColumnMenuItems,
            table,
          }) ??
          internalColumnMenuItems}
      </PopoverContent>
    </Popover>
  );
};
