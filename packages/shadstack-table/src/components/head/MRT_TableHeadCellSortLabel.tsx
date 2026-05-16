// oxlint-disable jsx-a11y/click-events-have-key-events -- verbatim port of upstream MRT
// oxlint-disable jsx-a11y/no-static-element-interactions -- verbatim port of upstream MRT
import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_Header, type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_TableHeadCellSortLabelProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<'span'> {
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCellSortLabel = <TData extends MRT_RowData>({
  className,
  header,
  table,
  ...rest
}: MRT_TableHeadCellSortLabelProps<TData>) => {
  const {
    getState,
    options: {
      icons: { ArrowDownwardIcon, SyncAltIcon },
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

  const Icon = !isSorted ? SyncAltIcon : ArrowDownwardIcon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          aria-label={sortTooltip}
          onClick={(e) => {
            e.stopPropagation();
            header.column.getToggleSortingHandler()?.(e as any);
          }}
          {...rest}
          className={cn(
            'relative inline-flex items-center flex-none w-[3ch] transition-all duration-150 ease-in-out',
            isSorted ? 'opacity-100' : 'opacity-30',
            className,
          )}
        >
          <Icon
            style={{
              transform: !isSorted
                ? 'rotate(-90deg) scaleX(0.9) translateX(-1px)'
                : direction === 'asc'
                  ? 'rotate(180deg)'
                  : undefined,
              transition: 'transform 150ms',
            }}
            className="text-muted-foreground"
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
