// oxlint-disable react-hooks/exhaustive-deps -- verbatim port of upstream MRT
// oxlint-disable react/no-array-index-key -- verbatim port of upstream MRT
import * as React from 'react';
import { Fragment, useMemo } from 'react';
import { Alert, AlertTitle } from '../../_ui/alert';
import { Badge } from '../../_ui/badge';
import { Button } from '../../_ui/button';
import { Collapsible, CollapsibleContent } from '../../_ui/collapsible';
import { cn } from '../../lib/utils';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getMRT_SelectAllHandler } from '../../utils/row.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_SelectCheckbox } from '../inputs/MRT_SelectCheckbox';

export interface MRT_ToolbarAlertBannerProps<
  TData extends MRT_RowData,
> extends React.ComponentProps<typeof Alert> {
  stackAlertBanner?: boolean;
  table: MRT_TableInstance<TData>;
}

export const MRT_ToolbarAlertBanner = <TData extends MRT_RowData>({
  className,
  stackAlertBanner,
  table,
  ...rest
}: MRT_ToolbarAlertBannerProps<TData>) => {
  const {
    getFilteredSelectedRowModel,
    getCoreRowModel,
    getState,
    options: {
      enableRowSelection,
      enableSelectAll,
      localization,
      manualPagination,
      positionToolbarAlertBanner,
      renderToolbarAlertBannerContent,
      rowCount,
      slotProps,
    },
    refs: { tablePaperRef },
  } = table;
  const { density, grouping, rowSelection, showAlertBanner } = getState();

  const alertProps = {
    ...parseFromValuesOrFunc(slotProps?.toolbarAlertBanner, {
      table,
    }),
    ...rest,
  };

  const chipProps = parseFromValuesOrFunc(slotProps?.toolbarAlertBannerChip, {
    table,
  });

  const totalRowCount = rowCount ?? getCoreRowModel().rows.length;
  const filteredRowCount = getFilteredSelectedRowModel().rows.length;

  const selectedRowCount = useMemo(
    () =>
      manualPagination ? Object.values(rowSelection).filter(Boolean).length : filteredRowCount,
    [rowSelection, totalRowCount, manualPagination, filteredRowCount],
  );

  const selectedAlert =
    selectedRowCount > 0 ? (
      <span className="flex items-center gap-3 whitespace-nowrap">
        {localization.selectedCountOfRowCountRowsSelected
          ?.replace('{selectedCount}', selectedRowCount.toLocaleString(localization.language))
          ?.replace('{rowCount}', totalRowCount.toLocaleString(localization.language))}
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => getMRT_SelectAllHandler({ table })(event, false, true)}
        >
          {localization.clearSelection}
        </Button>
      </span>
    ) : null;

  const groupedAlert =
    grouping.length > 0 ? (
      <span>
        {localization.groupedBy}{' '}
        {grouping.map((columnId, index) => (
          <Fragment key={columnId}>
            {index > 0 ? localization.thenBy : ''}
            <Badge variant="secondary" className="gap-1 mx-1" {...chipProps}>
              {table.getColumn(columnId).columnDef.header}
              <button
                type="button"
                onClick={() => table.getColumn(columnId).toggleGrouping()}
                className="ml-1 inline-flex items-center justify-center hover:opacity-80"
                aria-label="Remove"
              >
                ×
              </button>
            </Badge>
          </Fragment>
        ))}
      </span>
    ) : null;

  const open = showAlertBanner || !!selectedAlert || !!groupedAlert;

  const padding =
    positionToolbarAlertBanner !== 'head-overlay'
      ? '0.5rem 1rem'
      : density === 'spacious'
        ? '0.75rem 1.25rem'
        : density === 'comfortable'
          ? '0.5rem 0.75rem'
          : '0.25rem 0.5rem';

  return (
    <Collapsible open={open}>
      <CollapsibleContent>
        <Alert
          {...alertProps}
          style={{
            maxWidth: tablePaperRef.current?.clientWidth
              ? `calc(${tablePaperRef.current.clientWidth}px - 1rem)`
              : undefined,
            ...alertProps?.style,
          }}
          className={cn(
            'rounded-none p-0 w-full text-base',
            stackAlertBanner ? 'mb-0' : positionToolbarAlertBanner === 'bottom' && '-mb-4',
            className,
            alertProps?.className,
          )}
        >
          {renderToolbarAlertBannerContent?.({
            groupedAlert,
            selectedAlert,
            table,
          }) ?? (
            <>
              {alertProps?.title && <AlertTitle>{alertProps.title as React.ReactNode}</AlertTitle>}
              <div className="col-start-1 col-end-[-1] flex flex-col min-w-0" style={{ padding }}>
                {alertProps?.children as React.ReactNode}
                {alertProps?.children && (selectedAlert || groupedAlert) && <br />}
                <div className="flex items-center min-w-0">
                  {enableRowSelection &&
                    enableSelectAll &&
                    positionToolbarAlertBanner === 'head-overlay' && (
                      <MRT_SelectCheckbox table={table} />
                    )}{' '}
                  {selectedAlert}
                </div>
                {selectedAlert && groupedAlert && <br />}
                {groupedAlert}
              </div>
            </>
          )}
        </Alert>
      </CollapsibleContent>
    </Collapsible>
  );
};
