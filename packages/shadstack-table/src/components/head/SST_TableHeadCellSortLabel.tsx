import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type SST_Header, type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_TableHeadCellSortLabelProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'span'> {
  header: SST_Header<TData>;
  table: SST_TableInstance<TData>;
}

export const SST_TableHeadCellSortLabel = <TData extends SST_RowData>({
  className,
  header,
  table,
  ...rest
}: SST_TableHeadCellSortLabelProps<TData>) => {
  const {
    getState,
    options: {
      icons: { ArrowDownwardIcon, SortIcon },
      localization,
    },
  } = table;
  const { column } = header;
  const { columnDef } = column;
  const { isLoading, showSkeletons, sorting } = getState();

  const isSorted = !!column.getIsSorted();

  const sortTooltip =
    isLoading || showSkeletons
      ? ''
      : column.getIsSorted()
        ? column.getIsSorted() === 'desc'
          ? localization.sortedByColumnDesc.replace('{column}', columnDef.header)
          : localization.sortedByColumnAsc.replace('{column}', columnDef.header)
        : column.getNextSortingOrder() === 'desc'
          ? localization.sortByColumnDesc.replace('{column}', columnDef.header)
          : localization.sortByColumnAsc.replace('{column}', columnDef.header);

  const direction = isSorted ? (column.getIsSorted() as 'asc' | 'desc') : undefined;

  const sortIndex = sorting.length > 1 ? column.getSortIndex() + 1 : 0;

  const Icon = !isSorted ? SortIcon : ArrowDownwardIcon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- visual sort indicator; keyboard sorting is handled by the parent SST_TableHeadCell button which wraps this span */}
        <span
          aria-label={sortTooltip}
          onClick={(e) => {
            e.stopPropagation();
            header.column.getToggleSortingHandler()?.(e as any);
          }}
          {...rest}
          className={cn(
            'relative inline-flex items-center justify-center flex-none size-3.5 transition-all duration-150 ease-in-out',
            isSorted ? 'opacity-100' : 'opacity-50',
            className,
          )}
        >
          <Icon
            style={{
              transform: isSorted && direction === 'asc' ? 'rotate(180deg)' : undefined,
              transition: 'transform 150ms',
            }}
            className="size-3.5 text-muted-foreground"
          />
          {sortIndex > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
              {sortIndex}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{sortTooltip}</TooltipContent>
    </Tooltip>
  );
};
