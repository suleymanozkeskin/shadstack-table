// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import { useMemo } from 'react';
import { useSST_ColumnVirtualizer } from '../../hooks/useSST_ColumnVirtualizer';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseCSSVarId } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_TableBody, Memo_SST_TableBody } from '../body/SST_TableBody';
import { SST_TableFooter } from '../footer/SST_TableFooter';
import { SST_TableHead } from '../head/SST_TableHead';

export interface SST_TableProps<TData extends SST_RowData> extends React.ComponentProps<'table'> {
  table: SST_TableInstance<TData>;
}

export const SST_Table = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_TableProps<TData>) => {
  const {
    getFlatHeaders,
    getState,
    options: {
      columns,
      enableTableFooter,
      enableTableHead,
      layoutMode,
      memoMode,
      renderCaption,
      slotProps,
    },
  } = table;
  const { columnSizing, columnSizingInfo, columnVisibility } = getState();

  const tableProps = {
    ...parseFromValuesOrFunc(slotProps?.table, { table }),
    ...rest,
  };

  const Caption = parseFromValuesOrFunc(renderCaption, { table });

  const columnSizeVars = useMemo(() => {
    const headers = getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const colSize = header.getSize();
      colSizes[`--header-${parseCSSVarId(header.id)}-size`] = colSize;
      colSizes[`--col-${parseCSSVarId(header.column.id)}-size`] = colSize;
    }
    return colSizes;
  }, [columns, columnSizing, columnSizingInfo, columnVisibility]);

  const columnVirtualizer = useSST_ColumnVirtualizer(table);

  const commonTableGroupProps = {
    columnVirtualizer,
    table,
  };

  const isGrid = !!layoutMode?.startsWith('grid');

  return (
    <table
      {...tableProps}
      style={{ ...columnSizeVars, ...tableProps?.style }}
      className={cn(
        'border-separate relative caption-bottom text-sm min-w-max',
        isGrid ? 'grid' : 'table',
        className,
        tableProps?.className,
      )}
    >
      {!!Caption && <caption>{Caption}</caption>}
      {enableTableHead && <SST_TableHead {...commonTableGroupProps} />}
      {memoMode === 'table-body' || columnSizingInfo.isResizingColumn ? (
        <Memo_SST_TableBody {...commonTableGroupProps} />
      ) : (
        <SST_TableBody {...commonTableGroupProps} />
      )}
      {enableTableFooter && <SST_TableFooter {...commonTableGroupProps} />}
    </table>
  );
};
