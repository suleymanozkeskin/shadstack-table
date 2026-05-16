import * as React from 'react';
import { type DragEvent, type RefObject } from 'react';
import { type Button } from '../../_ui/button';
import { type MRT_Column, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { reorderColumn } from '../../utils/column.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_GrabHandleButton } from '../buttons/MRT_GrabHandleButton';

export interface MRT_TableHeadCellGrabHandleProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Button> {
  column: MRT_Column<TData>;
  table: MRT_TableInstance<TData>;
  tableHeadCellRef: RefObject<HTMLTableCellElement | null>;
}

export const MRT_TableHeadCellGrabHandle = <TData extends MRT_RowData>({
  column,
  table,
  tableHeadCellRef,
  ...rest
}: MRT_TableHeadCellGrabHandleProps<TData>) => {
  const {
    getState,
    options: { enableColumnOrdering, slotProps },
    setColumnOrder,
    setColumnPinning,
    setDraggingColumn,
    setHoveredColumn,
  } = table;
  const { columnDef } = column;
  const { columnOrder, draggingColumn, hoveredColumn } = getState();

  const iconButtonProps = {
    ...parseFromValuesOrFunc(slotProps?.columnDragHandle, { column, table }),
    ...parseFromValuesOrFunc(columnDef.slotProps?.columnDragHandle, {
      column,
      table,
    }),
    ...rest,
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    iconButtonProps?.onDragStart?.(event);
    setDraggingColumn(column);
    try {
      event.dataTransfer.setDragImage(tableHeadCellRef.current as HTMLElement, 0, 0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragEnd = (event: DragEvent<HTMLButtonElement>) => {
    iconButtonProps?.onDragEnd?.(event);
    if (hoveredColumn?.id === 'drop-zone') {
      column.toggleGrouping();
    } else if (enableColumnOrdering && hoveredColumn && hoveredColumn?.id !== draggingColumn?.id) {
      const reorderedColumns = reorderColumn(
        column,
        hoveredColumn as MRT_Column<TData>,
        columnOrder,
      );
      setColumnOrder(reorderedColumns);
      setColumnPinning(({ left = [], right = [] }) => ({
        left: reorderedColumns.filter((header) => left.includes(header)),
        right: reorderedColumns.filter((header) => right.includes(header)),
      }));
    }
    setDraggingColumn(null);
    setHoveredColumn(null);
  };

  return (
    <MRT_GrabHandleButton
      {...iconButtonProps}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      table={table}
    />
  );
};
