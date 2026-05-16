import * as React from 'react';
import { Collapsible, CollapsibleContent } from '../../_ui/collapsible';
import { Progress } from '../../_ui/progress';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_LinearProgressBarProps<TData extends SST_RowData> extends React.ComponentProps<
  typeof Progress
> {
  isTopToolbar: boolean;
  table: SST_TableInstance<TData>;
}

export const SST_LinearProgressBar = <TData extends SST_RowData>({
  className,
  isTopToolbar,
  table,
  ...rest
}: SST_LinearProgressBarProps<TData>) => {
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
            isIndeterminate && 'sst-progress-indeterminate',
            className,
            linearProgressProps?.className,
          )}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
