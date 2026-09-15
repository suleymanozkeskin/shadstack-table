import * as React from 'react';
import { useSST_TableState } from '../../hooks/useSST_TableState';
import { Button } from '../../_ui/button';
import { Spinner } from '../../_ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Row, type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_EditActionButtonsProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  row: SST_Row<TData>;
  table: SST_TableInstance<TData>;
  variant?: 'icon' | 'text';
}

export const SST_EditActionButtons = <TData extends SST_RowData>({
  className,
  row,
  table,
  variant = 'icon',
  ...rest
}: SST_EditActionButtonsProps<TData>) => {
  const {
    options: {
      icons: { CancelIcon, SaveIcon },
      localization,
      onCreatingRowCancel,
      onCreatingRowSave,
      onEditingRowCancel,
      onEditingRowSave,
    },
    refs: { editInputRefs },
    setCreatingRow,
    setEditingRow,
  } = table;

  const { creatingRow, editingRow, isSaving } = useSST_TableState(table, (s) => ({
    creatingRow: s.creatingRow,
    editingRow: s.editingRow,
    isSaving: s.isSaving,
  }));

  const isCreating = creatingRow?.id === row.id;
  const isEditing = editingRow?.id === row.id;

  const handleCancel = () => {
    if (isCreating) {
      onCreatingRowCancel?.({ row, table });
      setCreatingRow(null);
    } else if (isEditing) {
      onEditingRowCancel?.({ row, table });
      setEditingRow(null);
    }

    table.clearEditValues(row);
  };

  const handleSubmitRow = () => {
    // Read native text fields again so browser autofill is included.
    for (const [columnId, input] of Object.entries(editInputRefs.current ?? {})) {
      if (input instanceof HTMLInputElement) table.setEditValue(row, columnId, input.value);
    }

    if (isCreating)
      onCreatingRowSave?.({
        exitCreatingMode: () => setCreatingRow(null),
        row,
        table,
        values: table.getEditValues(row),
      });
    else if (isEditing) {
      onEditingRowSave?.({
        exitEditingMode: () => setEditingRow(null),
        row,
        table,
        values: table.getEditValues(row),
      });
    }
  };

  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- onClick is a stopPropagation barrier to prevent the row click from firing while editing; the buttons inside are the actual keyboard-focusable controls
    <div onClick={(e) => e.stopPropagation()} className={cn('flex gap-3', className)} {...rest}>
      {variant === 'icon' ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={localization.cancel}
                onClick={handleCancel}
                size="icon"
                variant="ghost"
              >
                <CancelIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{localization.cancel}</TooltipContent>
          </Tooltip>
          {((isCreating && onCreatingRowSave) || (isEditing && onEditingRowSave)) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={localization.save}
                  disabled={isSaving}
                  onClick={handleSubmitRow}
                  size="icon"
                  variant="ghost"
                >
                  {isSaving ? <Spinner size={18} /> : <SaveIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{localization.save}</TooltipContent>
            </Tooltip>
          )}
        </>
      ) : (
        <>
          <Button onClick={handleCancel} variant="outline" size="action">
            {localization.cancel}
          </Button>
          <Button disabled={isSaving} onClick={handleSubmitRow} size="action">
            {isSaving && <Spinner size={18} />}
            {localization.save}
          </Button>
        </>
      )}
    </div>
  );
};
