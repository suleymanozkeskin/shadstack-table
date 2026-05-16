// oxlint-disable eslint/no-underscore-dangle -- verbatim port of upstream MRT
// oxlint-disable jsx-a11y/click-events-have-key-events -- verbatim port of upstream MRT
// oxlint-disable jsx-a11y/no-static-element-interactions -- verbatim port of upstream MRT
import * as React from 'react';
import { Button } from '../../_ui/button';
import { Spinner } from '../../_ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_EditActionButtonsProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'div'> {
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
  variant?: 'icon' | 'text';
}

export const MRT_EditActionButtons = <TData extends MRT_RowData>({
  className,
  row,
  table,
  variant = 'icon',
  ...rest
}: MRT_EditActionButtonsProps<TData>) => {
  const {
    getState,
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
  const { creatingRow, editingRow, isSaving } = getState();

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
    row._valuesCache = {} as any; //reset values cache
  };

  const handleSubmitRow = () => {
    //look for auto-filled input values
    Object.values(editInputRefs.current ?? {})
      .filter((inputRef) => row.id === inputRef?.name?.split('_')?.[0])
      ?.forEach((input) => {
        if (input.value !== undefined && Object.hasOwn(row?._valuesCache as object, input.name)) {
          // @ts-expect-error
          row._valuesCache[input.name] = input.value;
        }
      });
    if (isCreating)
      onCreatingRowSave?.({
        exitCreatingMode: () => setCreatingRow(null),
        row,
        table,
        values: row._valuesCache,
      });
    else if (isEditing) {
      onEditingRowSave?.({
        exitEditingMode: () => setEditingRow(null),
        row,
        table,
        values: row?._valuesCache,
      });
    }
  };

  return (
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
          <Button onClick={handleCancel} variant="outline" className="min-w-[100px]">
            {localization.cancel}
          </Button>
          <Button disabled={isSaving} onClick={handleSubmitRow} className="min-w-[100px]">
            {isSaving && <Spinner size={18} />}
            {localization.save}
          </Button>
        </>
      )}
    </div>
  );
};
