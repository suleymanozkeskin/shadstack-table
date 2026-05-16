import * as React from 'react';
import { Spinner } from '../../_ui/spinner';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface SST_TableLoadingOverlayProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Spinner> {
  table: SST_TableInstance<TData>;
}

export const SST_TableLoadingOverlay = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_TableLoadingOverlayProps<TData>) => {
  const {
    options: {
      id,
      localization,
      mrtTheme: { baseBackgroundColor },
      slotProps,
    },
  } = table;

  const spinnerProps = {
    ...parseFromValuesOrFunc(slotProps?.spinner, { table }),
    ...rest,
  };

  return (
    <div
      className={cn(
        'absolute inset-0 z-[3] flex items-center justify-center',
        'max-h-screen w-full',
      )}
      style={{
        backgroundColor: `color-mix(in oklch, ${baseBackgroundColor} 50%, transparent)`,
      }}
    >
      <Spinner
        aria-label={localization.noRecordsToDisplay}
        id={`mrt-progress-${id}`}
        size={32}
        {...spinnerProps}
        className={cn(className, spinnerProps?.className)}
      />
    </div>
  );
};
