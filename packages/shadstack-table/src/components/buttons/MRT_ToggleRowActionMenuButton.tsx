import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import { MRT_EditActionButtons } from './MRT_EditActionButtons';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Cell, type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_RowActionMenu } from '../menus/MRT_RowActionMenu';

const commonIconButtonClasses =
  'h-8 w-8 opacity-60 transition-opacity duration-150 hover:opacity-100';

export interface MRT_ToggleRowActionMenuButtonProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  cell: MRT_Cell<TData>;
  row: MRT_Row<TData>;
  staticRowIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleRowActionMenuButton = <TData extends MRT_RowData>({
  cell,
  className,
  row,
  staticRowIndex,
  table,
  ...rest
}: MRT_ToggleRowActionMenuButtonProps<TData>) => {
  const {
    getState,
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

  const { creatingRow, editingRow } = getState();

  const isCreating = creatingRow?.id === row.id;
  const isEditing = editingRow?.id === row.id;

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
    setEditingRow({ ...row });
    setAnchorEl(null);
  };

  return (
    <>
      {renderRowActions && !showEditActionButtons ? (
        renderRowActions({ cell, row, staticRowIndex, table })
      ) : showEditActionButtons ? (
        <MRT_EditActionButtons row={row} table={table} />
      ) : !renderRowActionMenuItems &&
        parseFromValuesOrFunc(enableEditing, row) &&
        ['modal', 'row'].includes(editDisplayMode!) ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={localization.edit}
              onClick={handleStartEditMode}
              size="icon"
              variant="ghost"
              {...rest}
              className={cn(commonIconButtonClasses, className)}
            >
              <EditIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{localization.edit}</TooltipContent>
        </Tooltip>
      ) : renderRowActionMenuItems?.({
          row,
          staticRowIndex,
          table,
        } as any)?.length ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={localization.rowActions}
                onClick={handleOpenRowActionMenu}
                size="icon"
                variant="ghost"
                {...rest}
                className={cn(commonIconButtonClasses, className)}
              >
                <MoreHorizIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{localization.rowActions}</TooltipContent>
          </Tooltip>
          <MRT_RowActionMenu
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
