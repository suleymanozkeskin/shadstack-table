import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { useSST_TableState } from '../../hooks/useSST_TableState';
import { SST_EditActionButtons } from './SST_EditActionButtons';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { type SST_Cell, type SST_Row, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_RowActionMenu } from '../menus/SST_RowActionMenu';

export interface SST_ToggleRowActionMenuButtonProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  cell: SST_Cell<TData>;
  row: SST_Row<TData>;
  staticRowIndex?: number;
  table: SST_TableInstance<TData>;
}

export const SST_ToggleRowActionMenuButton = <TData extends SST_RowData>({
  cell,
  className,
  row,
  staticRowIndex,
  table,
  ...rest
}: SST_ToggleRowActionMenuButtonProps<TData>) => {
  const {
    options: {
      createDisplayMode,
      editDisplayMode,
      enableEditing,
      icons: { EditIcon, MoreHorizIcon },
      localization,
      renderRowActionMenuItems,
      renderRowActions,
    },
    setEditingRow,
  } = table;

  const { isCreating, isEditing } = useSST_TableState(table, (s) => ({
    isCreating: s.creatingRow?.id === row.id,
    isEditing: s.editingRow?.id === row.id,
  }));

  const showEditActionButtons =
    (isCreating && createDisplayMode === 'row') || (isEditing && editDisplayMode === 'row');

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenRowActionMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleStartEditMode = (event: MouseEvent) => {
    event.stopPropagation();
    //Pass the row itself, never a shallow copy. TanStack v9 puts row methods
    //on the prototype, so spreading yields an object without `getAllCells()` —
    //which `SST_EditRowModal` calls to build the edit form. The copy existed
    //only to force a new object identity, which the row already has here.
    setEditingRow(row);
    setAnchorEl(null);
  };

  return (
    <>
      {renderRowActions && !showEditActionButtons ? (
        renderRowActions({ cell, row, staticRowIndex, table })
      ) : showEditActionButtons ? (
        <SST_EditActionButtons row={row} table={table} />
      ) : !renderRowActionMenuItems &&
        parseFromValuesOrFunc(enableEditing, row) &&
        ['modal', 'row'].includes(editDisplayMode!) ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={localization.edit}
              onClick={handleStartEditMode}
              size="icon"
              purpose="row-action"
              variant="ghost"
              {...rest}
              className={className}
            >
              <EditIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{localization.edit}</TooltipContent>
        </Tooltip>
      ) : renderRowActionMenuItems?.({
          closeMenu: () => setAnchorEl(null),
          row,
          staticRowIndex,
          table,
        })?.length ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={localization.rowActions}
                onClick={handleOpenRowActionMenu}
                size="icon"
                purpose="row-action"
                variant="ghost"
                {...rest}
                className={className}
              >
                <MoreHorizIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{localization.rowActions}</TooltipContent>
          </Tooltip>
          <SST_RowActionMenu
            anchorEl={anchorEl}
            handleEdit={handleStartEditMode}
            row={row}
            setAnchorEl={setAnchorEl}
            staticRowIndex={staticRowIndex}
            table={table}
          />
        </>
      ) : null}
    </>
  );
};
