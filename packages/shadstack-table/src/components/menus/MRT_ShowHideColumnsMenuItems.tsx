// oxlint-disable eslint/no-shadow -- verbatim port of upstream MRT
// oxlint-disable react/no-array-index-key -- verbatim port of upstream MRT
import * as React from 'react';
import { type Dispatch, type DragEvent, type SetStateAction, useRef, useState } from 'react';
import { Label } from '../../_ui/label';
import { Switch } from '../../_ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Column, type MRT_RowData, type MRT_TableInstance } from '../../types';
import { reorderColumn } from '../../utils/column.utils';
import { MRT_ColumnPinningButtons } from '../buttons/MRT_ColumnPinningButtons';
import { MRT_GrabHandleButton } from '../buttons/MRT_GrabHandleButton';

export interface MRT_ShowHideColumnsMenuItemsProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'div'> {
  allColumns: MRT_Column<TData>[];
  column: MRT_Column<TData>;
  hoveredColumn: MRT_Column<TData> | null;
  isNestedColumns: boolean;
  setHoveredColumn: Dispatch<SetStateAction<MRT_Column<TData> | null>>;
  table: MRT_TableInstance<TData>;
}

export const MRT_ShowHideColumnsMenuItems = <TData extends MRT_RowData>({
  allColumns,
  className,
  column,
  hoveredColumn,
  isNestedColumns,
  setHoveredColumn,
  table,
  ...rest
}: MRT_ShowHideColumnsMenuItemsProps<TData>) => {
  const {
    getState,
    options: {
      enableColumnOrdering,
      enableColumnPinning,
      enableHiding,
      localization,
      mrtTheme: { draggingBorderColor },
    },
    setColumnOrder,
    setColumnPinning,
  } = table;
  const { columnOrder } = getState();
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const switchChecked = column.getIsVisible();

  const handleToggleColumnHidden = (column: MRT_Column<TData>) => {
    if (columnDefType === 'group') {
      column?.columns?.forEach?.((childColumn: MRT_Column<TData>) => {
        childColumn.toggleVisibility(!switchChecked);
      });
    } else {
      column.toggleVisibility();
    }
  };

  const menuItemRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    try {
      e.dataTransfer.setDragImage(menuItemRef.current as HTMLElement, 0, 0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragEnd = (_e: DragEvent<HTMLButtonElement>) => {
    setIsDragging(false);
    setHoveredColumn(null);
    if (hoveredColumn) {
      const reorderedColumns = reorderColumn(column, hoveredColumn, columnOrder);
      setColumnOrder(reorderedColumns);
      setColumnPinning(({ left = [], right = [] }) => ({
        left: reorderedColumns.filter((header) => left.includes(header)),
        right: reorderedColumns.filter((header) => right.includes(header)),
      }));
    }
  };

  const handleDragEnter = (_e: DragEvent) => {
    if (!isDragging && columnDef.enableColumnOrdering !== false) {
      setHoveredColumn(column);
    }
  };

  if (!columnDef.header || columnDef.visibleInShowHideMenu === false) {
    return null;
  }

  return (
    <>
      <div
        onDragEnter={handleDragEnter}
        ref={menuItemRef}
        {...rest}
        style={{
          paddingLeft: `${(column.depth + 0.5) * 2}rem`,
          outline:
            hoveredColumn?.id === column.id ? `2px dashed ${draggingBorderColor}` : undefined,
          outlineOffset: '-2px',
          ...rest.style,
        }}
        className={cn(
          'flex items-center justify-start py-1.5 pr-2',
          isDragging && 'opacity-50 outline outline-2 outline-dashed outline-muted-foreground',
          className,
        )}
      >
        <div className="flex flex-nowrap items-center gap-2">
          {columnDefType !== 'group' &&
            enableColumnOrdering &&
            !isNestedColumns &&
            (columnDef.enableColumnOrdering !== false ? (
              <MRT_GrabHandleButton
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                table={table}
              />
            ) : (
              <div className="w-7" />
            ))}
          {enableColumnPinning &&
            (column.getCanPin() ? (
              <MRT_ColumnPinningButtons column={column} table={table} />
            ) : (
              <div className="w-[70px]" />
            ))}
          {enableHiding ? (
            <Label
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                !column.getCanHide() && 'opacity-50 pointer-events-none',
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    checked={switchChecked}
                    disabled={!column.getCanHide()}
                    onCheckedChange={() => handleToggleColumnHidden(column)}
                  />
                </TooltipTrigger>
                <TooltipContent>{localization.toggleVisibility}</TooltipContent>
              </Tooltip>
              <span className={cn(columnDefType === 'display' && 'opacity-50')}>
                {columnDef.header}
              </span>
            </Label>
          ) : (
            <p className="self-center">{columnDef.header}</p>
          )}
        </div>
      </div>
      {column.columns?.map((c: MRT_Column<TData>, i) => (
        <MRT_ShowHideColumnsMenuItems
          allColumns={allColumns}
          column={c}
          hoveredColumn={hoveredColumn}
          isNestedColumns={isNestedColumns}
          key={`${i}-${c.id}`}
          setHoveredColumn={setHoveredColumn}
          table={table}
        />
      ))}
    </>
  );
};
