import * as React from 'react';
import { MRT_FilterTextField } from './MRT_FilterTextField';
import { cn } from '../../lib/utils';
import { type MRT_Header, type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_FilterRangeFieldsProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'div'> {
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_FilterRangeFields = <TData extends MRT_RowData>({
  className,
  header,
  table,
  ...rest
}: MRT_FilterRangeFieldsProps<TData>) => {
  return (
    <div {...rest} className={cn('grid grid-cols-2 gap-4', className)}>
      {[0, 1].map((rangeFilterIndex) => (
        <MRT_FilterTextField
          header={header}
          key={rangeFilterIndex}
          rangeFilterIndex={rangeFilterIndex}
          table={table}
        />
      ))}
    </div>
  );
};
