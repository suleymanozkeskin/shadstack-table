// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
// oxlint-disable react/no-array-index-key -- verbatim port of upstream MRT
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '../../_ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { Separator } from '../../_ui/separator';
import { MRT_ShowHideColumnsMenuItems } from './MRT_ShowHideColumnsMenuItems';
import { cn } from '../../lib/utils';
import {
  type MRT_Column,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_VisibilityState,
} from '../../types';
import { getDefaultColumnOrderIds } from '../../utils/displayColumn.utils';

export interface MRT_ShowHideColumnsMenuProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof PopoverContent> {
  anchorEl: HTMLElement | null;
  isSubMenu?: boolean;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  table: MRT_TableInstance<TData>;
}

export const MRT_ShowHideColumnsMenu = <TData extends MRT_RowData>({
  anchorEl,
  className,
  setAnchorEl,
  table,
  ...rest
}: MRT_ShowHideColumnsMenuProps<TData>) => {
  const {
    getAllColumns,
    getAllLeafColumns,
    getCenterLeafColumns,
    getIsAllColumnsVisible,
    getIsSomeColumnsPinned,
    getIsSomeColumnsVisible,
    getLeftLeafColumns,
    getRightLeafColumns,
    getState,
    initialState,
    options: {
      enableColumnOrdering,
      enableColumnPinning,
      enableHiding,
      localization,
      mrtTheme: { menuBackgroundColor },
    },
  } = table;
  const { columnOrder, columnPinning, density } = getState();
  const virtualRef = useMemo<React.RefObject<HTMLElement | null> | undefined>(
    () => (anchorEl ? { current: anchorEl } : undefined),
    [anchorEl],
  );

  const handleToggleAllColumns = (value?: boolean) => {
    const updates = getAllLeafColumns()
      .filter((column) => column.columnDef.enableHiding !== false)
      .reduce((acc, column) => {
        acc[column.id] = value ?? !column.getIsVisible();
        return acc;
      }, {} as MRT_VisibilityState);

    table.setColumnVisibility((old) => ({ ...old, ...updates }));
  };

  const allColumns = useMemo(() => {
    const columns = getAllColumns();
    if (columnOrder.length > 0 && !columns.some((col) => col.columnDef.columnDefType === 'group')) {
      return [
        ...getLeftLeafColumns(),
        ...Array.from(new Set(columnOrder)).map((colId) =>
          getCenterLeafColumns().find((col) => col?.id === colId),
        ),
        ...getRightLeafColumns(),
      ].filter(Boolean);
    }
    return columns;
  }, [
    columnOrder,
    columnPinning,
    getAllColumns(),
    getCenterLeafColumns(),
    getLeftLeafColumns(),
    getRightLeafColumns(),
  ]) as MRT_Column<TData>[];

  const isNestedColumns = allColumns.some((col) => col.columnDef.columnDefType === 'group');

  const hasColumnOrderChanged = useMemo(
    () =>
      !(
        columnOrder.length === initialState.columnOrder.length &&
        columnOrder.every((column, index) => column === initialState.columnOrder[index])
      ),

    [columnOrder, initialState.columnOrder],
  );

  const [hoveredColumn, setHoveredColumn] = useState<MRT_Column<TData> | null>(null);

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
        className={cn('w-auto min-w-[16rem] p-1', density === 'compact' && 'text-xs', className)}
        {...rest}
      >
        <div className="flex justify-between gap-2 p-2 pt-0">
          {enableHiding && (
            <Button
              size="sm"
              variant="ghost"
              disabled={!getIsSomeColumnsVisible()}
              onClick={() => handleToggleAllColumns(false)}
            >
              {localization.hideAll}
            </Button>
          )}
          {enableColumnOrdering && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => table.setColumnOrder(getDefaultColumnOrderIds(table.options, true))}
              disabled={!hasColumnOrderChanged}
            >
              {localization.resetOrder}
            </Button>
          )}
          {enableColumnPinning && (
            <Button
              size="sm"
              variant="ghost"
              disabled={!getIsSomeColumnsPinned()}
              onClick={() => table.resetColumnPinning(true)}
            >
              {localization.unpinAll}
            </Button>
          )}
          {enableHiding && (
            <Button
              size="sm"
              variant="ghost"
              disabled={getIsAllColumnsVisible()}
              onClick={() => handleToggleAllColumns(true)}
            >
              {localization.showAll}
            </Button>
          )}
        </div>
        <Separator />
        {allColumns.map((column) => (
          <MRT_ShowHideColumnsMenuItems
            allColumns={allColumns}
            column={column}
            hoveredColumn={hoveredColumn}
            isNestedColumns={isNestedColumns}
            key={column.id}
            setHoveredColumn={setHoveredColumn}
            table={table}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
};
