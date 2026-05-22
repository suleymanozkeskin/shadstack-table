import * as React from 'react';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_TableHeadCellResizeHandleProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableHeadCellResizeHandle = <TData extends SST_RowData>({
  className,
  header,
  table,
  ...rest
}: SST_TableHeadCellResizeHandleProps<TData>) => {
  const {
    getState,
    options: { columnResizeDirection, columnResizeMode },
    setColumnSizingInfo,
  } = table;
  const { density } = getState();
  const { column } = header;

  const handler = header.getResizeHandler();

  const mx = density === 'compact' ? '-8px' : density === 'comfortable' ? '-16px' : '-24px';

  const lr = column.columnDef.columnDefType === 'display' ? '4px' : '0';

  const isRtl = columnResizeDirection === 'rtl';

  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- column-resize handle is a visual affordance only; keyboard resize is provided separately via the column action menu
    <div
      className={cn(
        // inset-y-0 anchors the wrapper to the full vertical extent of the
        // th — without it the absolute-positioned wrapper collapses to 0
        // height and the divider inside (h-full) renders invisible.
        'SST-TableHeadCell-ResizeHandle-Wrapper absolute inset-y-0 flex items-center cursor-col-resize px-1 group',
        className,
      )}
      onDoubleClick={() => {
        setColumnSizingInfo((old) => ({
          ...old,
          isResizingColumn: false,
        }));
        column.resetSize();
      }}
      onMouseDown={handler}
      onTouchStart={handler}
      style={{
        transform:
          column.getIsResizing() && columnResizeMode === 'onEnd'
            ? `translateX(${(isRtl ? -1 : 1) * (getState().columnSizingInfo.deltaOffset ?? 0)}px)`
            : undefined,
        left: isRtl ? lr : undefined,
        right: !isRtl ? lr : undefined,
        marginLeft: isRtl ? mx : undefined,
        marginRight: !isRtl ? mx : undefined,
      }}
      {...rest}
    >
      {/*
       * Plain div instead of <Separator> — Separator's
       * `data-[orientation=vertical]:h-full` rule won (higher specificity
       * than `h-6`) and pulled height from a 0-height parent.
       */}
      <div
        className={cn(
          'SST-TableHeadCell-ResizeHandle-Divider rounded touch-none select-none translate-x-1 z-[4]',
          'h-6 w-0.5 bg-border',
          'group-hover:bg-primary',
          column.getIsResizing() ? '' : 'transition-colors duration-150 ease-in-out',
          column.getIsResizing() && 'bg-primary',
          header.subHeaders.length || columnResizeMode === 'onEnd' ? '' : 'group-active:opacity-0',
        )}
      />
    </div>
  );
};
