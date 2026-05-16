// oxlint-disable eslint/no-underscore-dangle -- verbatim port of upstream MRT
import * as React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../_ui/dialog';
import { cn } from '../../lib/utils';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_EditActionButtons } from '../buttons/MRT_EditActionButtons';
import { MRT_EditCellTextField } from '../inputs/MRT_EditCellTextField';

// Sensible defaults for the edit-row dialog size. Consumers can override via
// `slotProps.editRowDialog.className` (e.g. `h-[60vh] sm:max-w-[60vw]`) — the
// className flows through `cn()` + `tailwind-merge` so user classes take
// precedence over these defaults.
const DEFAULT_EDIT_DIALOG_CLASSNAME =
  'flex h-[80vh] w-[80vw] max-w-[80vw] flex-col gap-0 p-0 sm:max-w-[80vw]';

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

  // slotProps.editRowDialog / slotProps.createRowDialog flow onto DialogContent,
  // where Tailwind className overrides (e.g. `h-[60vh] sm:max-w-[60vw]`) actually
  // affect the visual surface. Dialog root only takes behavioral props.
  const slotContentProps = {
    ...parseFromValuesOrFunc(slotProps?.editRowDialog, { row, table }),
    ...(creatingRow && parseFromValuesOrFunc(slotProps?.createRowDialog, { row, table })),
  };
  const { className: slotClassName, ...slotContentRest } = slotContentProps ?? {};

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
        rest.onOpenChange?.(nextOpen);
      }}
      {...rest}
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
        <DialogContent
          className={cn(DEFAULT_EDIT_DIALOG_CLASSNAME, slotClassName)}
          {...slotContentRest}
        >
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-center">{localization.edit}</DialogTitle>
          </DialogHeader>
          {/* intentional preventDefault: edit-row is an in-browser modal with no server-side submit fallback */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
          >
            <div className="flex w-full flex-col gap-4">{internalEditComponents}</div>
          </form>
          <DialogFooter className="border-t px-6 py-4">
            <MRT_EditActionButtons row={row} table={table} variant="text" />
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};
