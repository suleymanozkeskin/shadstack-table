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
    <div {...rest} className={cn('flex items-center gap-2 w-full', className)}>
      {[0, 1].map((rangeFilterIndex) => (
        <div key={rangeFilterIndex} className="flex-1 min-w-0">
          <MRT_FilterTextField
            header={header}
            rangeFilterIndex={rangeFilterIndex}
            table={table}
          />
        </div>
      ))}
    </div>
  );
};
