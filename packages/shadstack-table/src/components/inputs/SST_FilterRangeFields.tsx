import * as React from 'react';
import { SST_FilterRangePopover } from './SST_FilterRangePopover';
import { SST_FilterTextField } from './SST_FilterTextField';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_FilterRangeFieldsProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'div'> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

// Threshold below which the inline Min/Max pair would overlap (each side has
// min-w-[110px] + 8px gap ≈ 228px). Above ~15rem the inline form has room;
// below it, we render a single popover trigger to keep the cell readable.
export const SST_FilterRangeFields = <TData extends SST_RowData>({
  className,
  header,
  table,
  ...rest
}: SST_FilterRangeFieldsProps<TData>) => {
  return (
    <div {...rest} className={cn('@container w-full', className)}>
      <div className="@[15rem]:hidden">
        <SST_FilterRangePopover header={header} table={table} />
      </div>
      <div className="hidden @[15rem]:flex w-full items-start gap-2">
        {[0, 1].map((rangeFilterIndex) => (
          <div key={rangeFilterIndex} className="min-w-0 flex-1">
            <SST_FilterTextField
              header={header}
              rangeFilterIndex={rangeFilterIndex}
              table={table}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
