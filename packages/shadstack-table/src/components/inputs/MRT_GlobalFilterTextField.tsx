// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
import * as React from 'react';
import { type ChangeEvent, type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../_ui/button';
import { Collapsible, CollapsibleContent } from '../../_ui/collapsible';
import { Input } from '../../_ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../_ui/tooltip';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_FilterOptionMenu } from '../menus/MRT_FilterOptionMenu';

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export interface MRT_GlobalFilterTextFieldProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Input> {
  table: MRT_TableInstance<TData>;
}

export const MRT_GlobalFilterTextField = <TData extends MRT_RowData>({
  className,
  table,
  ...rest
}: MRT_GlobalFilterTextFieldProps<TData>) => {
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
        <div className="relative inline-flex items-center">
          {enableGlobalFilterModes ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="absolute left-0 z-10 flex items-center">
                  <Button
                    aria-label={localization.changeSearchMode}
                    onClick={handleGlobalFilterMenuOpen}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                  >
                    <SearchIcon />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{localization.changeSearchMode}</TooltipContent>
            </Tooltip>
          ) : (
            <SearchIcon
              className="absolute left-2 text-muted-foreground"
              style={{ marginRight: '4px' }}
            />
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
              enableGlobalFilterModes ? 'pl-9' : 'pl-8',
              'pr-9',
              className,
              inputProps?.className,
            )}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="absolute right-0 z-10 flex items-center">
                <Button
                  aria-label={localization.clearSearch}
                  disabled={!searchValue?.length}
                  onClick={handleClear}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <CloseIcon />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{localization.clearSearch ?? ''}</TooltipContent>
          </Tooltip>
        </div>
        <MRT_FilterOptionMenu
          anchorEl={anchorEl}
          onSelect={handleClear}
          setAnchorEl={setAnchorEl}
          table={table}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
