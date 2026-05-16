import * as React from 'react';
import { Button } from '../../_ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_ExpandAllButtonProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Button
> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ExpandAllButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ExpandAllButtonProps<TData>) => {
  const {
    getCanSomeRowsExpand,
    getIsAllRowsExpanded,
    getIsSomeRowsExpanded,
    getState,
    options: {
      icons: { KeyboardDoubleArrowDownIcon },
      localization,
      renderDetailPanel,
      slotProps,
    },
    toggleAllRowsExpanded,
  } = table;
  const { density, isLoading } = getState();

  const iconButtonProps = {
    ...parseFromValuesOrFunc(slotProps?.expandAllButton, {
      table,
    }),
    ...rest,
  };

  const isAllRowsExpanded = getIsAllRowsExpanded();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            aria-label={localization.expandAll}
            disabled={isLoading || (!renderDetailPanel && !getCanSomeRowsExpand())}
            onClick={() => toggleAllRowsExpanded(!isAllRowsExpanded)}
            size="icon"
            variant="ghost"
            {...iconButtonProps}
            className={cn(
              density === 'compact' ? 'h-7 w-7' : 'h-9 w-9',
              density !== 'compact' && '-mt-1',
              iconButtonProps?.className,
            )}
            title={undefined}
          >
            {iconButtonProps?.children ?? (
              <KeyboardDoubleArrowDownIcon
                style={{
                  transform: `rotate(${
                    isAllRowsExpanded ? -180 : getIsSomeRowsExpanded() ? -90 : 0
                  }deg)`,
                  transition: 'transform 150ms',
                }}
              />
            )}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {iconButtonProps?.title ??
          (isAllRowsExpanded ? localization.collapseAll : localization.expandAll)}
      </TooltipContent>
    </Tooltip>
  );
};
