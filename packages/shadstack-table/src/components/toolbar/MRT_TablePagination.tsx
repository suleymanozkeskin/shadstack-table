// oxlint-disable react/no-array-index-key -- verbatim port of upstream MRT
import * as React from 'react';
import { Button } from '../../_ui/button';
import { Label } from '../../_ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../_ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

const defaultRowsPerPage = [5, 10, 15, 20, 25, 30, 50, 100];

function useDirection() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    setDir(document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr');
  }, []);
  return dir;
}

function getPageRange(currentPage: number, totalPages: number, siblings = 1) {
  const pages: (number | 'ellipsis')[] = [];
  const left = Math.max(1, currentPage - siblings);
  const right = Math.min(totalPages, currentPage + siblings);
  if (left > 2) pages.push(1, 'ellipsis');
  else for (let i = 1; i < left; i++) pages.push(i);
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('ellipsis', totalPages);
  else for (let i = right + 1; i <= totalPages; i++) pages.push(i);
  return pages;
}

export interface MRT_TablePaginationProps<TData extends MRT_RowData> {
  position?: 'bottom' | 'top';
  table: MRT_TableInstance<TData>;
}

export const MRT_TablePagination = <TData extends MRT_RowData>({
  position = 'bottom',
  table,
  ...rest
}: MRT_TablePaginationProps<TData>) => {
  const dir = useDirection();
  const flipStyle = dir === 'rtl' ? { transform: 'scaleX(-1)' } : undefined;

  const {
    getState,
    options: {
      enableToolbarInternalActions,
      icons: { ChevronLeftIcon, ChevronRightIcon, FirstPageIcon, LastPageIcon },
      id,
      localization,
      paginationDisplayMode,
      slotProps,
    },
  } = table;
  const {
    pagination: { pageIndex = 0, pageSize = 10 },
  } = getState();

  const paginationProps = {
    ...parseFromValuesOrFunc(slotProps?.pagination, {
      table,
    }),
    ...rest,
  };

  const totalRowCount = table.getRowCount();
  const numberOfPages = table.getPageCount();
  const showFirstLastPageButtons = numberOfPages > 2;
  const firstRowIndex = pageIndex * pageSize;
  const lastRowIndex = Math.min(pageIndex * pageSize + pageSize, totalRowCount);

  const {
    disabled = false,
    rowsPerPageOptions = defaultRowsPerPage,
    showRowsPerPage = true,
  } = (paginationProps as any) ?? {};

  const disableBack = pageIndex <= 0 || disabled;
  const disableNext = lastRowIndex >= totalRowCount || disabled;

  return (
    <div
      className={cn(
        'MuiTablePagination-root flex flex-wrap items-center gap-2 justify-self-end px-2 py-3 z-[2] relative',
        'sm:justify-center md:justify-between',
        position === 'top' && enableToolbarInternalActions && 'mt-12',
      )}
    >
      {showRowsPerPage && (
        <div className="flex items-center gap-2">
          <Label htmlFor={`mrt-rows-per-page-${id}`} className="mb-0">
            {localization.rowsPerPage}
          </Label>
          <Select
            disabled={disabled}
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(+value)}
          >
            <SelectTrigger
              id={`mrt-rows-per-page-${id}`}
              size="sm"
              aria-label={localization.rowsPerPage}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map((option: any) => {
                const value = typeof option !== 'number' ? option.value : option;
                const label = typeof option !== 'number' ? option.label : `${option}`;
                return (
                  <SelectItem key={value} value={String(value)}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {paginationDisplayMode === 'pages' ? (
        <nav className="flex items-center gap-1" aria-label="pagination">
          {showFirstLastPageButtons && (
            <Button
              size="icon"
              variant="ghost"
              disabled={disableBack}
              onClick={() => table.firstPage()}
              aria-label={localization.goToFirstPage}
            >
              <FirstPageIcon style={flipStyle} />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            disabled={disableBack}
            onClick={() => table.previousPage()}
            aria-label={localization.goToPreviousPage}
          >
            <ChevronLeftIcon style={flipStyle} />
          </Button>
          {getPageRange(pageIndex + 1, numberOfPages).map((page, i) =>
            page === 'ellipsis' ? (
              // stable by position — getPageRange emits at most 2 ellipses (left, right) in fixed order
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={page}
                size="icon"
                variant={page === pageIndex + 1 ? 'outline' : 'ghost'}
                onClick={() => table.setPageIndex(page - 1)}
                disabled={disabled}
              >
                {page}
              </Button>
            ),
          )}
          <Button
            size="icon"
            variant="ghost"
            disabled={disableNext}
            onClick={() => table.nextPage()}
            aria-label={localization.goToNextPage}
          >
            <ChevronRightIcon style={flipStyle} />
          </Button>
          {showFirstLastPageButtons && (
            <Button
              size="icon"
              variant="ghost"
              disabled={disableNext}
              onClick={() => table.lastPage()}
              aria-label={localization.goToLastPage}
            >
              <LastPageIcon style={flipStyle} />
            </Button>
          )}
        </nav>
      ) : paginationDisplayMode === 'default' ? (
        <>
          <span className="text-sm m-1 min-w-[8ch] text-center">{`${
            lastRowIndex === 0 ? 0 : (firstRowIndex + 1).toLocaleString(localization.language)
          }-${lastRowIndex.toLocaleString(localization.language)} ${
            localization.of
          } ${totalRowCount.toLocaleString(localization.language)}`}</span>
          <div className="flex gap-1">
            {showFirstLastPageButtons && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      aria-label={localization.goToFirstPage}
                      disabled={disableBack}
                      onClick={() => table.firstPage()}
                      size="icon"
                      variant="ghost"
                    >
                      <FirstPageIcon style={flipStyle} />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{localization.goToFirstPage}</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    aria-label={localization.goToPreviousPage}
                    disabled={disableBack}
                    onClick={() => table.previousPage()}
                    size="icon"
                    variant="ghost"
                  >
                    <ChevronLeftIcon style={flipStyle} />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{localization.goToPreviousPage}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    aria-label={localization.goToNextPage}
                    disabled={disableNext}
                    onClick={() => table.nextPage()}
                    size="icon"
                    variant="ghost"
                  >
                    <ChevronRightIcon style={flipStyle} />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{localization.goToNextPage}</TooltipContent>
            </Tooltip>
            {showFirstLastPageButtons && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      aria-label={localization.goToLastPage}
                      disabled={disableNext}
                      onClick={() => table.lastPage()}
                      size="icon"
                      variant="ghost"
                    >
                      <LastPageIcon style={flipStyle} />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{localization.goToLastPage}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
