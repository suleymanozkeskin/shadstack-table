import * as React from 'react';
import { type DragEvent, useEffect } from 'react';
import { useSST_TableState } from '../../hooks/useSST_TableState';
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
    options: { enableGrouping, localization },
    setHoveredColumn,
    setShowToolbarDropZone,
  } = table;

  const { draggingColumn, grouping, hoveredColumn, showToolbarDropZone } = useSST_TableState(table);

  const handleDragEnter = (_event: DragEvent<HTMLDivElement>) => {
    setHoveredColumn({ id: 'drop-zone' });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    //Auto-drive the drop-zone visibility from drag state. The MRT-era
    //`options.state?.showToolbarDropZone !== undefined` gate is gone: it was
    //always true when `options.state` carried the merged snapshot, and under
    //v9 ownership `options.state` holds only consumer-controlled state — a
    //consumer who controls the slice keeps ownership anyway because the
    //setter routes to their `onShowToolbarDropZoneChange`.
    setShowToolbarDropZone(
      !!enableGrouping &&
        !!draggingColumn &&
        draggingColumn.columnDef.enableGrouping !== false &&
        !grouping.includes(draggingColumn.id),
    );
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional narrow deps; setShowToolbarDropZone is a stable setter — adding it would cause render loops
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
