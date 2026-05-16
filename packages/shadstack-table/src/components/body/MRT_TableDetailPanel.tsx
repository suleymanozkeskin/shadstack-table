import * as React from 'react';
import { type RefObject } from 'react';
import { Collapsible, CollapsibleContent } from '../../_ui/collapsible';
import { cn } from '../../lib/utils';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_RowVirtualizer,
  type MRT_TableInstance,
  type MRT_VirtualItem,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableDetailPanelProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'td'> {
  parentRowRef: RefObject<HTMLTableRowElement | null>;
  row: MRT_Row<TData>;
  rowVirtualizer?: MRT_RowVirtualizer;
  staticRowIndex: number;
  table: MRT_TableInstance<TData>;
  virtualRow?: MRT_VirtualItem;
}

export const MRT_TableDetailPanel = <TData extends MRT_RowData>({
  className,
  parentRowRef,
  row,
  rowVirtualizer,
  staticRowIndex,
  table,
  virtualRow,
  ...rest
}: MRT_TableDetailPanelProps<TData>) => {
  const {
    getState,
    getVisibleLeafColumns,
    options: {
      layoutMode,
      mrtTheme: { baseBackgroundColor },
      renderDetailPanel,
      slotProps,
    },
  } = table;
  const { isLoading } = getState();

  const tableRowProps = parseFromValuesOrFunc(slotProps?.tableBodyRow, {
    isDetailPanel: true,
    row,
    staticRowIndex,
    table,
  });

  const tableCellProps = {
    ...parseFromValuesOrFunc(slotProps?.detailPanel, {
      row,
      table,
    }),
    ...rest,
  };

  const DetailPanel = !isLoading && renderDetailPanel?.({ row, table });
  const isGrid = !!layoutMode?.startsWith('grid');

  return (
    <tr
      className={cn('Mui-TableBodyCell-DetailPanel', isGrid && 'flex')}
      data-index={renderDetailPanel ? staticRowIndex * 2 + 1 : staticRowIndex}
      ref={(node: HTMLTableRowElement | null) => {
        if (node) {
          rowVirtualizer?.measureElement?.(node);
        }
      }}
      {...tableRowProps}
      style={{
        position: virtualRow ? 'absolute' : undefined,
        top: virtualRow ? `${parentRowRef.current?.getBoundingClientRect()?.height}px` : undefined,
        transform: virtualRow ? `translateY(${virtualRow?.start}px)` : undefined,
        width: '100%',
        ...tableRowProps?.style,
      }}
    >
      <td
        className={cn(
          'Mui-TableBodyCell-DetailPanel w-full',
          isGrid && 'flex',
          !row.getIsExpanded() && 'border-b-0',
          className,
          tableCellProps?.className,
        )}
        colSpan={getVisibleLeafColumns().length}
        {...(tableCellProps as React.TdHTMLAttributes<HTMLTableCellElement>)}
        style={{
          backgroundColor: virtualRow ? baseBackgroundColor : undefined,
          paddingTop: !!DetailPanel && row.getIsExpanded() ? '1rem' : 0,
          paddingBottom: !!DetailPanel && row.getIsExpanded() ? '1rem' : 0,
          transition: !virtualRow ? 'all 150ms ease-in-out' : undefined,
          ...tableCellProps?.style,
        }}
      >
        {virtualRow ? (
          row.getIsExpanded() && DetailPanel
        ) : (
          <Collapsible open={row.getIsExpanded()}>
            <CollapsibleContent>{DetailPanel}</CollapsibleContent>
          </Collapsible>
        )}
      </td>
    </tr>
  );
};
