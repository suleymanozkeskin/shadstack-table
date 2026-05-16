import * as React from 'react';
import { Collapsible, CollapsibleContent } from '../../_ui/collapsible';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';
import { getColumnFilterInfo } from '../../utils/column.utils';
import { SST_FilterCheckbox } from '../inputs/SST_FilterCheckbox';
import { SST_FilterRangeFields } from '../inputs/SST_FilterRangeFields';
import { SST_FilterRangeSlider } from '../inputs/SST_FilterRangeSlider';
import { SST_FilterTextField } from '../inputs/SST_FilterTextField';

export interface SST_TableHeadCellFilterContainerProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Collapsible> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableHeadCellFilterContainer = <TData extends SST_RowData>({
  header,
  table,
  ...rest
}: SST_TableHeadCellFilterContainerProps<TData>) => {
  const {
    getState,
    options: { columnFilterDisplayMode },
  } = table;
  const { showColumnFilters } = getState();
  const { column } = header;
  const { columnDef } = column;
  const { isRangeFilter } = getColumnFilterInfo({ header, table });

  return (
    <Collapsible open={showColumnFilters || columnFilterDisplayMode === 'popover'} {...rest}>
      <CollapsibleContent>
        {columnDef.filterVariant === 'checkbox' ? (
          <SST_FilterCheckbox column={column} table={table} />
        ) : columnDef.filterVariant === 'range-slider' ? (
          <SST_FilterRangeSlider header={header} table={table} />
        ) : isRangeFilter ? (
          <SST_FilterRangeFields header={header} table={table} />
        ) : (
          <SST_FilterTextField header={header} table={table} />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
