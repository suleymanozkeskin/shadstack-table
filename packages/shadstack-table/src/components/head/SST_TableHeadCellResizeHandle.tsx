// oxlint-disable jsx-a11y/no-static-element-interactions -- verbatim port of upstream MRT
import * as React from 'react';
import { Separator } from '../../_ui/separator';
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
    <div
      className={cn(
        'Mui-TableHeadCell-ResizeHandle-Wrapper absolute cursor-col-resize px-1',
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
      <Separator
        orientation="vertical"
        className={cn(
          'Mui-TableHeadCell-ResizeHandle-Divider rounded touch-none select-none translate-x-1 z-[4]',
          'h-6 w-0.5',
          column.getIsResizing() ? '' : 'transition-all duration-150 ease-in-out',
          'active:bg-primary',
          header.subHeaders.length || columnResizeMode === 'onEnd'
            ? 'active:opacity-100'
            : 'active:opacity-0',
        )}
      />
    </div>
  );
};
