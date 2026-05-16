// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import { type ChangeEvent, type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../_ui/button';
import { Collapsible, CollapsibleContent } from '../../_ui/collapsible';
import { Input } from '../../_ui/input';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { SST_FilterOptionMenu } from '../menus/SST_FilterOptionMenu';

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export interface SST_GlobalFilterTextFieldProps<
  TData extends SST_RowData,
> extends React.ComponentProps<typeof Input> {
  table: SST_TableInstance<TData>;
}

export const SST_GlobalFilterTextField = <TData extends SST_RowData>({
  className,
  table,
  ...rest
}: SST_GlobalFilterTextFieldProps<TData>) => {
  const {
    getState,
    options: {
      enableGlobalFilterModes,
      icons: { CloseIcon, SearchIcon },
      localization,
      manualFiltering,
      slotProps,
    },
    refs: { searchInputRef },
    setGlobalFilter,
  } = table;
  const { globalFilter, showGlobalFilter } = getState();

  const inputProps = {
    ...parseFromValuesOrFunc(slotProps?.searchInput, {
      table,
    }),
    ...rest,
  };

  const isMounted = useRef(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchValue, setSearchValue] = useState(globalFilter ?? '');

  const handleChangeDebounced = useCallback(
    debounce(
      (newValue: string) => {
        setGlobalFilter(newValue ?? undefined);
      },
      manualFiltering ? 500 : 250,
    ),
    [],
  );

  const applyGlobalFilterValue = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    handleChangeDebounced(event.target.value);
  };

  const handleGlobalFilterMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClear = () => {
    setSearchValue('');
    setGlobalFilter(undefined);
  };

  useEffect(() => {
    if (isMounted.current) {
      if (globalFilter === undefined) {
        handleClear();
      } else {
        setSearchValue(globalFilter);
      }
    }
    isMounted.current = true;
  }, [globalFilter]);

  return (
    <Collapsible open={showGlobalFilter}>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left-2 data-[state=open]:slide-in-from-left-2">
        <div className="relative flex items-center w-full min-w-[200px]">
          {enableGlobalFilterModes ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-1">
              <Button
                aria-label={localization.changeSearchMode}
                onClick={handleGlobalFilterMenuOpen}
                size="icon"
                variant="ghost"
                title={localization.changeSearchMode}
                className="pointer-events-auto h-7 w-7"
              >
                <SearchIcon />
              </Button>
            </span>
          ) : (
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          )}
          <Input
            autoComplete="off"
            onChange={applyGlobalFilterValue}
            placeholder={localization.search}
            value={searchValue ?? ''}
            {...inputProps}
            ref={(inputRef) => {
              searchInputRef.current = inputRef;
              if (typeof inputProps?.ref === 'function') inputProps.ref(inputRef);
            }}
            className={cn(
              'w-full',
              enableGlobalFilterModes ? 'pl-9' : 'pl-8',
              'pr-9',
              className,
              inputProps?.className,
            )}
          />
          <span
            className={cn(
              'pointer-events-none absolute inset-y-0 right-1 z-10 flex items-center',
              (searchValue?.length ?? 0) > 0 ? 'visible' : 'invisible',
            )}
          >
            <Button
              aria-label={localization.clearSearch}
              disabled={!searchValue?.length}
              onClick={handleClear}
              size="icon"
              variant="ghost"
              title={localization.clearSearch}
              className="pointer-events-auto h-7 w-7"
            >
              <CloseIcon className="size-3.5" />
            </Button>
          </span>
        </div>
        <SST_FilterOptionMenu
          anchorEl={anchorEl}
          onSelect={handleClear}
          setAnchorEl={setAnchorEl}
          table={table}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
