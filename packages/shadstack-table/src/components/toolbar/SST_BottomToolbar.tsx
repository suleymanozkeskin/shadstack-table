import * as React from 'react';
import { SST_LinearProgressBar } from './SST_LinearProgressBar';
import { SST_TablePagination } from './SST_TablePagination';
import { SST_ToolbarAlertBanner } from './SST_ToolbarAlertBanner';
import { SST_ToolbarDropZone } from './SST_ToolbarDropZone';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

// See SST_TopToolbar — same lazy-init pattern avoids a mount-time setState
// bump when the query is already matching at first render.
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
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

export interface SST_BottomToolbarProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  table: SST_TableInstance<TData>;
}

export const SST_BottomToolbar = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_BottomToolbarProps<TData>) => {
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
      <SST_LinearProgressBar isTopToolbar={false} table={table} />
      {positionToolbarAlertBanner === 'bottom' && (
        <SST_ToolbarAlertBanner stackAlertBanner={stackAlertBanner} table={table} />
      )}
      {['both', 'bottom'].includes(positionToolbarDropZone ?? '') && (
        <SST_ToolbarDropZone table={table} />
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
            <SST_TablePagination position="bottom" table={table} />
          )}
        </div>
      </div>
    </div>
  );
};
