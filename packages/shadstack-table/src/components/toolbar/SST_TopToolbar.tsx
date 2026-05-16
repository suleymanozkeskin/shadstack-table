import * as React from 'react';
import { SST_LinearProgressBar } from './SST_LinearProgressBar';
import { SST_TablePagination } from './SST_TablePagination';
import { SST_ToolbarAlertBanner } from './SST_ToolbarAlertBanner';
import { SST_ToolbarDropZone } from './SST_ToolbarDropZone';
import { SST_ToolbarInternalButtons } from './SST_ToolbarInternalButtons';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_GlobalFilterTextField } from '../inputs/SST_GlobalFilterTextField';

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

export interface SST_TopToolbarProps<TData extends SST_RowData> {
  table: SST_TableInstance<TData>;
}

export const SST_TopToolbar = <TData extends SST_RowData>({
  table,
}: SST_TopToolbarProps<TData>) => {
  const {
    getState,
    options: {
      enableGlobalFilter,
      enablePagination,
      enableToolbarInternalActions,
      positionGlobalFilter,
      positionPagination,
      positionToolbarAlertBanner,
      positionToolbarDropZone,
      renderTopToolbarCustomActions,
      slotProps,
    },
    refs: { topToolbarRef },
  } = table;

  const { isFullScreen, showGlobalFilter } = getState();

  const isMobile = useMediaQuery('(max-width:720px)');
  const isTablet = useMediaQuery('(max-width:1024px)');

  const toolbarProps = parseFromValuesOrFunc(slotProps?.topToolbar, { table });

  const stackAlertBanner =
    isMobile || !!renderTopToolbarCustomActions || (showGlobalFilter && isTablet);

  const globalFilterProps = {
    table,
  };

  return (
    <div
      {...toolbarProps}
      ref={(ref: HTMLDivElement | null) => {
        topToolbarRef.current = ref!;
        if (typeof toolbarProps?.ref === 'function') toolbarProps.ref(ref!);
      }}
      style={{
        backgroundColor: table.options.mrtTheme.baseBackgroundColor,
        top: isFullScreen ? '0' : undefined,
        ...toolbarProps?.style,
      }}
      className={cn(
        'grid items-start flex-wrap-reverse min-h-14 overflow-hidden transition-all duration-150 ease-in-out z-[1]',
        isFullScreen ? 'sticky' : 'relative',
        toolbarProps?.className,
      )}
    >
      {positionToolbarAlertBanner === 'top' && (
        <SST_ToolbarAlertBanner stackAlertBanner={stackAlertBanner} table={table} />
      )}
      {['both', 'top'].includes(positionToolbarDropZone ?? '') && (
        <SST_ToolbarDropZone table={table} />
      )}
      <div
        className={cn(
          'box-border flex items-start gap-2 justify-between p-2 right-0 top-0 w-full',
          stackAlertBanner ? 'relative' : 'absolute',
        )}
      >
        {enableGlobalFilter && positionGlobalFilter === 'left' && (
          <SST_GlobalFilterTextField {...globalFilterProps} />
        )}
        {renderTopToolbarCustomActions?.({ table }) ?? <span />}
        {enableToolbarInternalActions ? (
          <div className="flex items-center flex-wrap-reverse gap-2 justify-end">
            {enableGlobalFilter && positionGlobalFilter === 'right' && (
              <SST_GlobalFilterTextField {...globalFilterProps} />
            )}
            <SST_ToolbarInternalButtons table={table} />
          </div>
        ) : (
          enableGlobalFilter &&
          positionGlobalFilter === 'right' && <SST_GlobalFilterTextField {...globalFilterProps} />
        )}
      </div>
      {enablePagination && ['both', 'top'].includes(positionPagination ?? '') && (
        <SST_TablePagination position="top" table={table} />
      )}
      <SST_LinearProgressBar isTopToolbar table={table} />
    </div>
  );
};
