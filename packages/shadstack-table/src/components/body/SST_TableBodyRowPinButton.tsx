import * as React from 'react';
import { type Button } from '../../_ui/button';
import { cn } from '../../lib/utils';
import { type SST_Row, type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_RowPinButton } from '../buttons/SST_RowPinButton';

export interface SST_TableBodyRowPinButtonProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Button> {
  row: SST_Row<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableBodyRowPinButton = <TData extends SST_RowData>({
  row,
  table,
  ...rest
}: SST_TableBodyRowPinButtonProps<TData>) => {
  const {
    getState,
    options: { enableRowPinning, rowPinningDisplayMode },
  } = table;
  const { density } = getState();

  const canPin = parseFromValuesOrFunc(enableRowPinning, row as any);

  if (!canPin) return null;

  const rowPinButtonProps = {
    row,
    table,
    ...rest,
  };

  if (rowPinningDisplayMode === 'top-and-bottom' && !row.getIsPinned()) {
    return (
      <div className={cn('flex', density === 'compact' ? 'flex-row' : 'flex-col')}>
        <SST_RowPinButton pinningPosition="top" {...rowPinButtonProps} />
        <SST_RowPinButton pinningPosition="bottom" {...rowPinButtonProps} />
      </div>
    );
  }

  return (
    <SST_RowPinButton
      pinningPosition={rowPinningDisplayMode === 'bottom' ? 'bottom' : 'top'}
      {...rowPinButtonProps}
    />
  );
};
