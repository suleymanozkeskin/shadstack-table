import * as React from 'react';
import { type DragEvent, type RefObject } from 'react';
import { type Button } from '../../_ui/button';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_GrabHandleButton } from '../buttons/MRT_GrabHandleButton';

export interface MRT_TableBodyRowGrabHandleProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  row: MRT_Row<TData>;
  rowRef: RefObject<HTMLTableRowElement | null>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableBodyRowGrabHandle = <TData extends MRT_RowData>({
  row,
  rowRef,
  table,
  ...rest
}: MRT_TableBodyRowGrabHandleProps<TData>) => {
  const {
    options: { slotProps },
  } = table;

  const iconButtonProps = {
    ...parseFromValuesOrFunc(slotProps?.rowDragHandle, {
      row,
      table,
    }),
    ...rest,
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    iconButtonProps?.onDragStart?.(event);
    try {
      event.dataTransfer.setDragImage(rowRef.current as HTMLElement, 0, 0);
    } catch (e) {
      console.error(e);
    }
    table.setDraggingRow(row as any);
  };

  const handleDragEnd = (event: DragEvent<HTMLButtonElement>) => {
    iconButtonProps?.onDragEnd?.(event);
    table.setDraggingRow(null);
    table.setHoveredRow(null);
  };

  return (
    <MRT_GrabHandleButton
      {...iconButtonProps}
      location="row"
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      table={table}
    />
  );
};
