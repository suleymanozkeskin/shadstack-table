// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import { type DragEvent, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToolbarDropZoneProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'div'> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToolbarDropZone = <TData extends MRT_RowData>({
  className,
  table,
  ...rest
}: MRT_ToolbarDropZoneProps<TData>) => {
  const {
    getState,
    options: { enableGrouping, localization },
    setHoveredColumn,
    setShowToolbarDropZone,
  } = table;

  const { draggingColumn, grouping, hoveredColumn, showToolbarDropZone } = getState();

  const handleDragEnter = (_event: DragEvent<HTMLDivElement>) => {
    setHoveredColumn({ id: 'drop-zone' });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (table.options.state?.showToolbarDropZone !== undefined) {
      setShowToolbarDropZone(
        !!enableGrouping &&
          !!draggingColumn &&
          draggingColumn.columnDef.enableGrouping !== false &&
          !grouping.includes(draggingColumn.id),
      );
    }
  }, [enableGrouping, draggingColumn, grouping]);

  if (!showToolbarDropZone) return null;

  return (
    <div
      className={cn(
        'Mui-ToolbarDropZone absolute inset-0 z-[4] flex items-center justify-center backdrop-blur-sm border-2 border-dashed border-primary',
        'animate-in fade-in-0',
        hoveredColumn?.id === 'drop-zone' ? 'bg-primary/20' : 'bg-primary/10',
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      {...rest}
    >
      <p className="italic">
        {localization.dropToGroupBy.replace('{column}', draggingColumn?.columnDef?.header ?? '')}
      </p>
    </div>
  );
};
