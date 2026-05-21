// oxlint-disable react-hooks/exhaustive-deps -- intentional; revisit when refactoring
import * as React from 'react';
import { type DragEvent, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_ToolbarDropZoneProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  table: SST_TableInstance<TData>;
}

export const SST_ToolbarDropZone = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_ToolbarDropZoneProps<TData>) => {
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
        'SST-ToolbarDropZone absolute inset-0 z-[4] flex items-center justify-center backdrop-blur-sm border-2 border-dashed border-primary',
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
