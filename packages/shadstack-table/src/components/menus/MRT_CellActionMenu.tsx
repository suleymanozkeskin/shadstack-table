// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { MRT_ActionMenuItem } from './MRT_ActionMenuItem';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { openEditingCell } from '../../utils/cell.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_CellActionMenuProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof PopoverContent
> {
  table: MRT_TableInstance<TData>;
}

export const MRT_CellActionMenu = <TData extends MRT_RowData>({
  className,
  table,
  ...rest
}: MRT_CellActionMenuProps<TData>) => {
  const {
    getState,
    options: {
      editDisplayMode,
      enableClickToCopy,
      enableEditing,
      icons: { ContentCopy, EditIcon },
      localization,
      mrtTheme: { menuBackgroundColor },
      renderCellActionMenuItems,
    },
    refs: { actionCellRef },
  } = table;
  const { actionCell, density } = getState();
  const cell = actionCell!;
  const virtualRef = React.useMemo<React.RefObject<HTMLElement | null> | undefined>(
    () => (actionCellRef.current ? { current: actionCellRef.current } : undefined),
    [actionCellRef.current],
  );

  const handleClose = (event?: any) => {
    event?.stopPropagation();
    table.setActionCell(null);
    actionCellRef.current = null;
  };

  if (!cell) return null;
  const { row } = cell;
  const { column } = cell;
  const { columnDef } = column;

  const internalMenuItems = [
    (parseFromValuesOrFunc(enableClickToCopy, cell) === 'context-menu' ||
      parseFromValuesOrFunc(columnDef.enableClickToCopy, cell) === 'context-menu') && (
      <MRT_ActionMenuItem
        icon={<ContentCopy />}
        key={'mrt-copy'}
        label={localization.copy}
        onClick={(event) => {
          event.stopPropagation();
          navigator.clipboard.writeText(cell.getValue() as string);
          handleClose();
        }}
        table={table}
      />
    ),
    parseFromValuesOrFunc(enableEditing, row) && editDisplayMode === 'cell' && (
      <MRT_ActionMenuItem
        icon={<EditIcon />}
        key={'mrt-edit'}
        label={localization.edit}
        onClick={() => {
          openEditingCell({ cell, table });
          handleClose();
        }}
        table={table}
      />
    ),
  ].filter(Boolean);

  const renderActionProps = {
    cell,
    closeMenu: handleClose,
    column,
    internalMenuItems,
    row,
    table,
  };

  const menuItems =
    columnDef.renderCellActionMenuItems?.(renderActionProps) ??
    renderCellActionMenuItems?.(renderActionProps);

  if (!menuItems?.length && !internalMenuItems?.length) return null;

  return (
    <Popover
      open={!!cell}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      {virtualRef && <PopoverAnchor virtualRef={virtualRef as any} />}
      <PopoverContent
        align="start"
        sideOffset={8}
        onClick={(event) => event.stopPropagation()}
        style={{ backgroundColor: menuBackgroundColor }}
        className={cn('w-auto min-w-[8rem] p-1', density === 'compact' && 'text-xs', className)}
        {...rest}
      >
        {menuItems ?? internalMenuItems}
      </PopoverContent>
    </Popover>
  );
};
