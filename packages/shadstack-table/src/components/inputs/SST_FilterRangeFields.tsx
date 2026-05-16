import * as React from 'react';
import { SST_FilterTextField } from './SST_FilterTextField';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_FilterRangeFieldsProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_FilterRangeFields = <TData extends SST_RowData>({
  className,
  header,
  table,
  ...rest
}: SST_FilterRangeFieldsProps<TData>) => {
  return (
    <div {...rest} className={cn('flex items-start gap-2 w-full', className)}>
      {[0, 1].map((rangeFilterIndex) => (
        <div key={rangeFilterIndex} className="flex-1 min-w-0">
          <SST_FilterTextField header={header} rangeFilterIndex={rangeFilterIndex} table={table} />
        </div>
      ))}
    </div>
  );
};
