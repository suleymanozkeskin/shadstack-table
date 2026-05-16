import * as React from 'react';
import { Spinner } from '../../_ui/spinner';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableLoadingOverlayProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Spinner> {
  table: MRT_TableInstance<TData>;
}

export const MRT_TableLoadingOverlay = <TData extends MRT_RowData>({
  className,
  table,
  ...rest
}: MRT_TableLoadingOverlayProps<TData>) => {
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
