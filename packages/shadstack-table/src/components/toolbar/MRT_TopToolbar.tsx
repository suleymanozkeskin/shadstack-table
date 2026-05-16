import * as React from 'react';
import { MRT_LinearProgressBar } from './MRT_LinearProgressBar';
import { MRT_TablePagination } from './MRT_TablePagination';
import { MRT_ToolbarAlertBanner } from './MRT_ToolbarAlertBanner';
import { MRT_ToolbarDropZone } from './MRT_ToolbarDropZone';
import { MRT_ToolbarInternalButtons } from './MRT_ToolbarInternalButtons';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_GlobalFilterTextField } from '../inputs/MRT_GlobalFilterTextField';

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

export interface MRT_TopToolbarProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

export const MRT_TopToolbar = <TData extends MRT_RowData>({
  table,
}: MRT_TopToolbarProps<TData>) => {
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
        <MRT_ToolbarAlertBanner stackAlertBanner={stackAlertBanner} table={table} />
      )}
      {['both', 'top'].includes(positionToolbarDropZone ?? '') && (
        <MRT_ToolbarDropZone table={table} />
      )}
      <div
        className={cn(
          'box-border flex items-start gap-2 justify-between p-2 right-0 top-0 w-full',
          stackAlertBanner ? 'relative' : 'absolute',
        )}
      >
        {enableGlobalFilter && positionGlobalFilter === 'left' && (
          <MRT_GlobalFilterTextField {...globalFilterProps} />
        )}
        {renderTopToolbarCustomActions?.({ table }) ?? <span />}
        {enableToolbarInternalActions ? (
          <div className="flex items-center flex-wrap-reverse gap-2 justify-end">
            {enableGlobalFilter && positionGlobalFilter === 'right' && (
              <MRT_GlobalFilterTextField {...globalFilterProps} />
            )}
            <MRT_ToolbarInternalButtons table={table} />
          </div>
        ) : (
          enableGlobalFilter &&
          positionGlobalFilter === 'right' && <MRT_GlobalFilterTextField {...globalFilterProps} />
        )}
      </div>
      {enablePagination && ['both', 'top'].includes(positionPagination ?? '') && (
        <MRT_TablePagination position="top" table={table} />
      )}
      <MRT_LinearProgressBar isTopToolbar table={table} />
    </div>
  );
};
