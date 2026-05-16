import * as React from 'react';
import { Collapsible, CollapsibleContent } from '../../_ui/collapsible';
import { Progress } from '../../_ui/progress';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_LinearProgressBarProps<TData extends MRT_RowData> extends React.ComponentProps<
  typeof Progress
> {
  isTopToolbar: boolean;
  table: MRT_TableInstance<TData>;
}

export const MRT_LinearProgressBar = <TData extends MRT_RowData>({
  className,
  isTopToolbar,
  table,
  ...rest
}: MRT_LinearProgressBarProps<TData>) => {
  const {
    getState,
    options: { slotProps },
  } = table;
  const { isSaving, showProgressBars } = getState();

  const linearProgressProps = {
    ...parseFromValuesOrFunc(slotProps?.linearProgress, {
      isTopToolbar,
      table,
    }),
    ...rest,
  };

  const open = showProgressBars !== false && (showProgressBars || isSaving);
  const isIndeterminate = linearProgressProps.value === undefined;

  return (
    <Collapsible open={open}>
      <CollapsibleContent className={cn('absolute w-full', isTopToolbar ? 'bottom-0' : 'top-0')}>
        <Progress
          aria-busy="true"
          aria-label="Loading"
          {...linearProgressProps}
          value={isIndeterminate ? undefined : linearProgressProps.value}
          className={cn(
            'relative',
            isIndeterminate && 'mrt-progress-indeterminate',
            className,
            linearProgressProps?.className,
          )}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
