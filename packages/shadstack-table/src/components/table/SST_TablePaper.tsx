// oxlint-disable jsx-a11y/no-static-element-interactions -- verbatim port of upstream MRT
import * as React from 'react';
import { SST_TableContainer } from './SST_TableContainer';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_BottomToolbar } from '../toolbar/SST_BottomToolbar';
import { SST_TopToolbar } from '../toolbar/SST_TopToolbar';

export interface SST_TablePaperProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  table: SST_TableInstance<TData>;
}

export const SST_TablePaper = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_TablePaperProps<TData>) => {
  const {
    getState,
    options: {
      enableBottomToolbar,
      enableTopToolbar,
      mrtTheme: { baseBackgroundColor },
      renderBottomToolbar,
      renderTopToolbar,
      slotProps,
    },
    refs: { tablePaperRef },
  } = table;
  const { isFullScreen } = getState();

  const paperProps = {
    ...parseFromValuesOrFunc(slotProps?.tablePaper, { table }),
    ...rest,
  };

  return (
    <div
      onKeyDown={(e) => e.key === 'Escape' && table.setIsFullScreen(false)}
      {...paperProps}
      ref={(ref: HTMLDivElement | null) => {
        tablePaperRef.current = ref!;
        if (typeof paperProps?.ref === 'function') paperProps.ref(ref!);
      }}
      style={{
        backgroundColor: baseBackgroundColor,
        ...(isFullScreen
          ? {
              bottom: 0,
              height: '100dvh',
              left: 0,
              margin: 0,
              maxHeight: '100dvh',
              maxWidth: '100dvw',
              padding: 0,
              position: 'fixed',
              right: 0,
              top: 0,
              width: '100dvw',
              zIndex: 50,
            }
          : {}),
        ...paperProps?.style,
      }}
      className={cn(
        'w-full max-w-full min-w-0 rounded-md border shadow-sm bg-card overflow-hidden transition-all duration-100 ease-in-out',
        className,
        paperProps?.className,
      )}
    >
      {enableTopToolbar &&
        (parseFromValuesOrFunc(renderTopToolbar, { table }) ?? <SST_TopToolbar table={table} />)}
      <SST_TableContainer table={table} />
      {enableBottomToolbar &&
        (parseFromValuesOrFunc(renderBottomToolbar, { table }) ?? (
          <SST_BottomToolbar table={table} />
        ))}
    </div>
  );
};
