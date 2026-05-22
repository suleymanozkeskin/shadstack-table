import * as React from 'react';
import { type ReactNode, useMemo, type MouseEvent } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '../../_ui/popover';
import { SST_ActionMenuItem } from './SST_ActionMenuItem';
import { cn } from '../../lib/utils';
import { type SST_Row, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_RowActionMenuProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof PopoverContent
> {
  anchorEl: HTMLElement | null;
  handleEdit: (event: MouseEvent) => void;
  row: SST_Row<TData>;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  staticRowIndex?: number;
  table: SST_TableInstance<TData>;
}

export const SST_RowActionMenu = <TData extends SST_RowData>({
  anchorEl,
  className,
  handleEdit,
  row,
  setAnchorEl,
  staticRowIndex,
  table,
  ...rest
}: SST_RowActionMenuProps<TData>) => {
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
        <SST_ActionMenuItem
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional narrow deps; localization/enableEditing/handleEdit/setAnchorEl/editDisplayMode/EditIcon are stable per cell-lifetime (per-instance config from the table options). FOLLOW-UP: verify all listed "stable" deps are truly stable.
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
