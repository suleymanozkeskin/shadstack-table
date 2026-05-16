// oxlint-disable eslint/no-underscore-dangle -- verbatim port of upstream MRT
import * as React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../_ui/dialog';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_EditActionButtons } from '../buttons/MRT_EditActionButtons';
import { MRT_EditCellTextField } from '../inputs/MRT_EditCellTextField';

export interface MRT_EditRowModalProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Dialog
> {
  open: boolean;
  table: MRT_TableInstance<TData>;
}

export const MRT_EditRowModal = <TData extends MRT_RowData>({
  open,
  table,
  ...rest
}: MRT_EditRowModalProps<TData>) => {
  const {
    getState,
    options: {
      localization,
      onCreatingRowCancel,
      onEditingRowCancel,
      renderCreateRowDialogContent,
      renderEditRowDialogContent,
      slotProps,
    },
    setCreatingRow,
    setEditingRow,
  } = table;
  const { creatingRow, editingRow } = getState();
  const row = (creatingRow ?? editingRow) as MRT_Row<TData>;

  const dialogProps = {
    ...parseFromValuesOrFunc(slotProps?.editRowDialog, { row, table }),
    ...(creatingRow && parseFromValuesOrFunc(slotProps?.createRowDialog, { row, table })),
    ...rest,
  };

  const internalEditComponents: React.ReactNode[] = [];
  for (const cell of row.getAllCells()) {
    if (cell.column.columnDef.columnDefType === 'data') {
      internalEditComponents.push(
        <MRT_EditCellTextField cell={cell as any} key={cell.id} table={table as any} />,
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          if (creatingRow) {
            onCreatingRowCancel?.({ row, table });
            setCreatingRow(null);
          } else {
            onEditingRowCancel?.({ row, table });
            setEditingRow(null);
          }
          row._valuesCache = {} as any;
        }
        dialogProps.onOpenChange?.(nextOpen);
      }}
      {...dialogProps}
    >
      {((creatingRow &&
        renderCreateRowDialogContent?.({
          internalEditComponents,
          row,
          table,
        })) ||
        renderEditRowDialogContent?.({
          internalEditComponents,
          row,
          table,
        })) ?? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{localization.edit}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-8 pt-4 w-full">{internalEditComponents}</div>
          </form>
          <DialogFooter className="p-5">
            <MRT_EditActionButtons row={row} table={table} variant="text" />
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};
