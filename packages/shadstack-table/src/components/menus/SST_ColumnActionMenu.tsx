// oxlint-disable eslint/no-underscore-dangle -- intentional; revisit when refactoring
import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { SST_ActionMenuItem } from './SST_ActionMenuItem';
import { SST_FilterOptionMenu } from './SST_FilterOptionMenu';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';

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
    getState,
    options: {
      columnFilterDisplayMode,
      columnFilterModeOptions,
      enableColumnFilterModes,
      enableColumnFilters,
      enableColumnPinning,
      enableColumnResizing,
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
    setColumnSizingInfo,
    setShowColumnFilters,
  } = table;
  const { column } = header;
  const { columnDef } = column;
  const { columnSizing, columnVisibility, density, showColumnFilters } = getState();
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
    setColumnSizingInfo((old) => ({ ...old, isResizingColumn: false }));
    column.resetSize();
    setAnchorEl(null);
  };

  const handleHideColumn = () => {
    column.toggleVisibility(false);
    setAnchorEl(null);
  };

  const handlePinColumn = (pinDirection: 'left' | 'right' | false) => {
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

  const internalColumnMenuItems = [
    ...(enableSorting && column.getCanSort()
      ? [
          enableSortingRemoval !== false && (
            <SST_ActionMenuItem
              disabled={column.getIsSorted() === false}
              icon={<ClearAllIcon />}
              key={0}
              label={localization.clearSort}
              onClick={handleClearSort}
              table={table}
            />
          ),
          <SST_ActionMenuItem
            disabled={column.getIsSorted() === 'asc'}
            icon={<SortIcon style={{ transform: 'rotate(180deg) scaleX(-1)' }} />}
            key={1}
            label={localization.sortByColumnAsc?.replace('{column}', String(columnDef.header))}
            onClick={handleSortAsc}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={column.getIsSorted() === 'desc'}
            divider={enableColumnFilters || enableGrouping || enableHiding}
            icon={<SortIcon />}
            key={2}
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
            key={3}
            label={localization.clearFilter}
            onClick={handleClearFilter}
            table={table}
          />,
          columnFilterDisplayMode === 'subheader' && (
            <SST_ActionMenuItem
              disabled={showColumnFilters && !enableColumnFilterModes}
              divider={enableGrouping || enableHiding}
              icon={<FilterListIcon />}
              key={4}
              label={localization.filterByColumn?.replace('{column}', String(columnDef.header))}
              onClick={showColumnFilters ? handleOpenFilterModeMenu : handleFilterByColumn}
              onOpenSubMenu={showFilterModeSubMenu ? handleOpenFilterModeMenu : undefined}
              table={table}
            />
          ),
          showFilterModeSubMenu && (
            <SST_FilterOptionMenu
              anchorEl={filterMenuAnchorEl}
              header={header}
              key={5}
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
            key={6}
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
            disabled={column.getIsPinned() === 'left' || !column.getCanPin()}
            icon={<PushPinIcon style={{ transform: 'rotate(90deg)' }} />}
            key={7}
            label={localization.pinToLeft}
            onClick={() => handlePinColumn('left')}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={column.getIsPinned() === 'right' || !column.getCanPin()}
            icon={<PushPinIcon style={{ transform: 'rotate(-90deg)' }} />}
            key={8}
            label={localization.pinToRight}
            onClick={() => handlePinColumn('right')}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={!column.getIsPinned()}
            divider={enableHiding}
            icon={<PushPinIcon />}
            key={9}
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
            key={10}
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
            key={11}
            label={localization.hideColumn?.replace('{column}', String(columnDef.header))}
            onClick={handleHideColumn}
            table={table}
          />,
          <SST_ActionMenuItem
            disabled={!Object.values(columnVisibility).filter((visible) => !visible).length}
            icon={<ViewColumnIcon />}
            key={12}
            label={localization.showAllColumns?.replace('{column}', String(columnDef.header))}
            onClick={handleShowAllColumns}
            table={table}
          />,
        ]
      : []),
  ].filter(Boolean);

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
