import * as React from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { SST_ActionMenuItem } from './SST_ActionMenuItem';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { openEditingCell } from '../../utils/cell.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_CellActionMenuProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof PopoverContent
> {
  table: SST_TableInstance<TData>;
}

export const SST_CellActionMenu = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_CellActionMenuProps<TData>) => {
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
  // Invariant: actionCellRef is already a stable RefObject from useSST_TableInstance;
  // Radix's PopoverAnchor reads `.current` lazily during positioning, so we can hand
  // the ref through directly instead of synthesizing a wrapper object in a useMemo
  // whose ref.current dep never triggers React invalidation anyway.
  const virtualRef = actionCellRef;

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
      <SST_ActionMenuItem
        icon={<ContentCopy />}
        key={'sst-copy'}
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
      <SST_ActionMenuItem
        icon={<EditIcon />}
        key={'sst-edit'}
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
      <PopoverAnchor virtualRef={virtualRef as any} />
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
