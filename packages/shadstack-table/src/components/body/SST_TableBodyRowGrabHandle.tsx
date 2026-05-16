import * as React from 'react';
import { type DragEvent, type RefObject } from 'react';
import { type Button } from '../../_ui/button';
import { type SST_Row, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_GrabHandleButton } from '../buttons/SST_GrabHandleButton';

export interface SST_TableBodyRowGrabHandleProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  row: SST_Row<TData>;
  rowRef: RefObject<HTMLTableRowElement | null>;
  table: SST_TableInstance<TData>;
}

export const SST_TableBodyRowGrabHandle = <TData extends SST_RowData>({
  row,
  rowRef,
  table,
  ...rest
}: SST_TableBodyRowGrabHandleProps<TData>) => {
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
    <SST_GrabHandleButton
      {...iconButtonProps}
      location="row"
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      table={table}
    />
  );
};
