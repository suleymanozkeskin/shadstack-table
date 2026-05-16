import * as React from 'react';
import { type MouseEvent } from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Row, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_ExpandButtonProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Button
> {
  row: SST_Row<TData>;
  staticRowIndex?: number;
  table: SST_TableInstance<TData>;
}

export const SST_ExpandButton = <TData extends SST_RowData>({
  row,
  staticRowIndex,
  table,
}: SST_ExpandButtonProps<TData>) => {
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const {
    getState,
    options: {
      icons: { ExpandMoreIcon },
      localization,
      positionExpandColumn,
      renderDetailPanel,
      slotProps,
    },
  } = table;
  const { density } = getState();

  const iconButtonProps = parseFromValuesOrFunc(slotProps?.expandButton, {
    row,
    staticRowIndex,
    table,
  });

  const canExpand = row.getCanExpand();
  const isExpanded = row.getIsExpanded();

  const handleToggleExpand = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    row.toggleExpanded();
    iconButtonProps?.onClick?.(event);
  };

  const detailPanel = !!renderDetailPanel?.({ row, table });
  const indentSide = isRtl || positionExpandColumn === 'last' ? 'mr' : 'ml';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            aria-label={localization.expand}
            disabled={!canExpand && !detailPanel}
            size="icon"
            variant="ghost"
            {...iconButtonProps}
            onClick={handleToggleExpand}
            style={{
              [indentSide === 'mr' ? 'marginRight' : 'marginLeft']: `${row.depth * 16}px`,
              ...iconButtonProps?.style,
            }}
            className={cn(
              density === 'compact' ? 'h-7 w-7' : 'h-9 w-9',
              !canExpand && !detailPanel && 'opacity-30',
              iconButtonProps?.className,
            )}
            title={undefined}
          >
            {iconButtonProps?.children ?? (
              <ExpandMoreIcon
                style={{
                  transform: `rotate(${
                    !canExpand && !renderDetailPanel
                      ? positionExpandColumn === 'last' || isRtl
                        ? 90
                        : -90
                      : isExpanded
                        ? -180
                        : 0
                  }deg)`,
                  transition: 'transform 150ms',
                }}
              />
            )}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {iconButtonProps?.title ?? (isExpanded ? localization.collapse : localization.expand)}
      </TooltipContent>
    </Tooltip>
  );
};
