import * as React from 'react';
import { MRT_LinearProgressBar } from './MRT_LinearProgressBar';
import { MRT_TablePagination } from './MRT_TablePagination';
import { MRT_ToolbarAlertBanner } from './MRT_ToolbarAlertBanner';
import { MRT_ToolbarDropZone } from './MRT_ToolbarDropZone';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export interface MRT_BottomToolbarProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'div'> {
  table: MRT_TableInstance<TData>;
}

export const MRT_BottomToolbar = <TData extends MRT_RowData>({
  className,
  table,
  ...rest
}: MRT_BottomToolbarProps<TData>) => {
  const {
    getState,
    options: {
      enablePagination,
      positionPagination,
      positionToolbarAlertBanner,
      positionToolbarDropZone,
      renderBottomToolbarCustomActions,
      slotProps,
    },
    refs: { bottomToolbarRef },
  } = table;
  const { isFullScreen } = getState();

  const isMobile = useMediaQuery('(max-width:720px)');

  const toolbarProps = {
    ...parseFromValuesOrFunc(slotProps?.bottomToolbar, { table }),
    ...rest,
  };

  const stackAlertBanner = isMobile || !!renderBottomToolbarCustomActions;

  return (
    <div
      {...toolbarProps}
      ref={(node: HTMLDivElement | null) => {
        if (node) {
          bottomToolbarRef.current = node;
          if (typeof toolbarProps?.ref === 'function') toolbarProps.ref(node);
        }
      }}
      style={{
        backgroundColor: table.options.mrtTheme.baseBackgroundColor,
        bottom: isFullScreen ? '0' : undefined,
        boxShadow: '0 1px 2px -1px color-mix(in oklch, var(--foreground) 50%, transparent) inset',
        left: 0,
        right: 0,
        ...toolbarProps?.style,
      }}
      className={cn(
        'grid items-start flex-wrap-reverse min-h-14 overflow-hidden transition-all duration-150 ease-in-out z-[1]',
        isFullScreen ? 'fixed' : 'relative',
        className,
        toolbarProps?.className,
      )}
    >
      <MRT_LinearProgressBar isTopToolbar={false} table={table} />
      {positionToolbarAlertBanner === 'bottom' && (
        <MRT_ToolbarAlertBanner stackAlertBanner={stackAlertBanner} table={table} />
      )}
      {['both', 'bottom'].includes(positionToolbarDropZone ?? '') && (
        <MRT_ToolbarDropZone table={table} />
      )}
      <div className="box-border flex items-center justify-between p-2 w-full">
        {renderBottomToolbarCustomActions ? renderBottomToolbarCustomActions({ table }) : <span />}
        <div
          className={cn(
            'flex justify-end',
            stackAlertBanner ? 'relative' : 'absolute right-0 top-0',
          )}
        >
          {enablePagination && ['both', 'bottom'].includes(positionPagination ?? '') && (
            <MRT_TablePagination position="bottom" table={table} />
          )}
        </div>
      </div>
    </div>
  );
};
