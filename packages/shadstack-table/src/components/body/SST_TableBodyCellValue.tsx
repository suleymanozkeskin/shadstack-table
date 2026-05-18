// oxlint-disable eslint/no-underscore-dangle -- intentional; revisit when refactoring
import { type ReactNode, type RefObject } from 'react';
import { highlightWords } from '../../utils/highlightWords';
import { type SST_Cell, type SST_RowData, type SST_TableInstance } from '../../types';

const allowedTypes = ['string', 'number'];

export interface SST_TableBodyCellValueProps<TData extends SST_RowData> {
  cell: SST_Cell<TData>;
  rowRef?: RefObject<HTMLTableRowElement | null>;
  staticColumnIndex?: number;
  staticRowIndex?: number;
  table: SST_TableInstance<TData>;
}

export const SST_TableBodyCellValue = <TData extends SST_RowData>({
  cell,
  rowRef,
  staticColumnIndex,
  staticRowIndex,
  table,
}: SST_TableBodyCellValueProps<TData>) => {
  const {
    getState,
    options: {
      enableFilterMatchHighlighting,
      mrtTheme: { matchHighlightColor },
    },
  } = table;
  const { column, row } = cell;
  const { columnDef } = column;
  const { globalFilter, globalFilterFn } = getState();
  const filterValue = column.getFilterValue();

  let renderedCellValue =
    cell.getIsAggregated() && columnDef.AggregatedCell
      ? columnDef.AggregatedCell({
          cell,
          column,
          row,
          table,
          staticColumnIndex,
          staticRowIndex,
        })
      : row.getIsGrouped() && !cell.getIsGrouped()
        ? null
        : cell.getIsGrouped() && columnDef.GroupedCell
          ? columnDef.GroupedCell({
              cell,
              column,
              row,
              table,
              staticColumnIndex,
              staticRowIndex,
            })
          : undefined;

  const isGroupedValue = renderedCellValue !== undefined;

  if (!isGroupedValue) {
    renderedCellValue = cell.renderValue() as ReactNode | number | string;
  }

  if (
    enableFilterMatchHighlighting &&
    columnDef.enableFilterMatchHighlighting !== false &&
    String(renderedCellValue) &&
    allowedTypes.includes(typeof renderedCellValue) &&
    ((filterValue &&
      allowedTypes.includes(typeof filterValue) &&
      ['autocomplete', 'text'].includes(columnDef.filterVariant!)) ||
      (globalFilter && allowedTypes.includes(typeof globalFilter) && column.getCanGlobalFilter()))
  ) {
    const chunks = highlightWords({
      matchExactly: (filterValue ? columnDef._filterFn : globalFilterFn) !== 'fuzzy',
      query: (filterValue ?? globalFilter ?? '').toString(),
      text: renderedCellValue?.toString() as string,
    });
    if (chunks.length > 1 || chunks[0]?.match) {
      renderedCellValue = (
        <span aria-label={renderedCellValue as string} role="note">
          {chunks.map(({ key, match, text }) => (
            <span
              aria-hidden="true"
              className={match ? 'text-foreground rounded-xs px-px py-0.5' : undefined}
              key={key}
              style={match ? { backgroundColor: matchHighlightColor } : undefined}
            >
              {text}
            </span>
          ))}
        </span>
      );
    }
  }

  if (columnDef.Cell && !isGroupedValue) {
    renderedCellValue = columnDef.Cell({
      cell,
      column,
      renderedCellValue,
      row,
      rowRef,
      staticColumnIndex,
      staticRowIndex,
      table,
    });
  }

  return renderedCellValue;
};
