// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import { type ReactNode, useMemo, type MouseEvent } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { MRT_ActionMenuItem } from './MRT_ActionMenuItem';
import { cn } from '../../lib/utils';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_RowActionMenuProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof PopoverContent
> {
  anchorEl: HTMLElement | null;
  handleEdit: (event: MouseEvent) => void;
  row: MRT_Row<TData>;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  staticRowIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_RowActionMenu = <TData extends MRT_RowData>({
  anchorEl,
  className,
  handleEdit,
  row,
  setAnchorEl,
  staticRowIndex,
  table,
  ...rest
}: MRT_RowActionMenuProps<TData>) => {
  const {
    getState,
    options: {
      editDisplayMode,
      enableEditing,
      icons: { EditIcon },
      localization,
      mrtTheme: { menuBackgroundColor },
      renderRowActionMenuItems,
    },
  } = table;
  const { density } = getState();
  const virtualRef = useMemo<React.RefObject<HTMLElement | null> | undefined>(
    () => (anchorEl ? { current: anchorEl } : undefined),
    [anchorEl],
  );

  const menuItems = useMemo(() => {
    const items: ReactNode[] = [];
    const editItem = parseFromValuesOrFunc(enableEditing, row) &&
      ['modal', 'row'].includes(editDisplayMode!) && (
        <MRT_ActionMenuItem
          key={'edit'}
          icon={<EditIcon />}
          label={localization.edit}
          onClick={handleEdit}
          table={table}
        />
      );
    if (editItem) items.push(editItem);
    const rowActionMenuItems = renderRowActionMenuItems?.({
      closeMenu: () => setAnchorEl(null),
      row,
      staticRowIndex,
      table,
    });
    if (rowActionMenuItems?.length) items.push(...rowActionMenuItems);
    return items;
  }, [renderRowActionMenuItems, row, staticRowIndex, table]);

  if (!menuItems.length) return null;

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
        onClick={(event) => event.stopPropagation()}
        style={{ backgroundColor: menuBackgroundColor }}
        className={cn('w-auto min-w-[8rem] p-1', density === 'compact' && 'text-xs', className)}
        {...rest}
      >
        {menuItems}
      </PopoverContent>
    </Popover>
  );
};
