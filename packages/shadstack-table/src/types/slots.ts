import type * as React from 'react';
import type { Alert } from '../_ui/alert';
import type { Badge } from '../_ui/badge';
import type { Button } from '../_ui/button';
import type { Checkbox } from '../_ui/checkbox';
import type { DialogContent } from '../_ui/dialog';
import type { Input } from '../_ui/input';
import type { Pagination } from '../_ui/pagination';
import type { Progress } from '../_ui/progress';
import type { Skeleton } from '../_ui/skeleton';
import type { Slider } from '../_ui/slider';
import type { Spinner } from '../_ui/spinner';
import type { SST_Cell } from './cell';
import type { SST_Column, SST_HeaderGroup } from './column';
import type { SST_Row, SST_RowData } from './row';
import type { SST_TableInstance } from './instance';

export type SST_ColumnSlotProps<TData extends SST_RowData, TValue = unknown> = {
  columnActionsButton?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  columnDragHandle?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  copyButton?:
    | ((props: {
        cell: SST_Cell<TData, TValue>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  editInput?:
    | ((props: {
        cell: SST_Cell<TData, TValue>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Input>)
    | React.ComponentProps<typeof Input>;
  filterAutocomplete?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Input>)
    | React.ComponentProps<typeof Input>;
  filterCheckbox?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Checkbox>)
    | React.ComponentProps<typeof Checkbox>;
  filterDatePicker?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'input'>)
    | React.ComponentProps<'input'>;
  filterDateTimePicker?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'input'>)
    | React.ComponentProps<'input'>;
  filterInput?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Input>)
    | React.ComponentProps<typeof Input>;
  filterSlider?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Slider>)
    | React.ComponentProps<typeof Slider>;
  filterTimePicker?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'input'>)
    | React.ComponentProps<'input'>;
  tableBodyCell?:
    | ((props: {
        cell: SST_Cell<TData, TValue>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'td'>)
    | React.ComponentProps<'td'>;
  tableFooterCell?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'td'>)
    | React.ComponentProps<'td'>;
  tableHeadCell?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'th'>)
    | React.ComponentProps<'th'>;
};

export type SST_TableSlotProps<TData extends SST_RowData> = {
  bottomToolbar?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
    | React.ComponentProps<'div'>;
  columnActionsButton?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  columnDragHandle?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  copyButton?:
    | ((props: {
        cell: SST_Cell<TData>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  createRowDialog?:
    | ((props: {
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof DialogContent>)
    | React.ComponentProps<typeof DialogContent>;
  detailPanel?:
    | ((props: {
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'div'>)
    | React.ComponentProps<'div'>;
  editInput?:
    | ((props: {
        cell: SST_Cell<TData>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Input>)
    | React.ComponentProps<typeof Input>;
  editRowDialog?:
    | ((props: {
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof DialogContent>)
    | React.ComponentProps<typeof DialogContent>;
  expandAllButton?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  expandButton?:
    | ((props: {
        row: SST_Row<TData>;
        staticRowIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  filterAutocomplete?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Input>)
    | React.ComponentProps<typeof Input>;
  filterCheckbox?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Checkbox>)
    | React.ComponentProps<typeof Checkbox>;
  filterDatePicker?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'input'>)
    | React.ComponentProps<'input'>;
  filterDateTimePicker?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'input'>)
    | React.ComponentProps<'input'>;
  filterInput?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Input>)
    | React.ComponentProps<typeof Input>;
  filterSlider?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Slider>)
    | React.ComponentProps<typeof Slider>;
  filterTimePicker?:
    | ((props: {
        column: SST_Column<TData>;
        rangeFilterIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'input'>)
    | React.ComponentProps<'input'>;
  linearProgress?:
    | ((props: {
        isTopToolbar: boolean;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Progress>)
    | React.ComponentProps<typeof Progress>;
  pagination?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Pagination> & {
        disabled?: boolean;
        rowsPerPageOptions?: { label: string; value: number }[] | number[];
        showRowsPerPage?: boolean;
      })
    | (React.ComponentProps<typeof Pagination> & {
        disabled?: boolean;
        rowsPerPageOptions?: { label: string; value: number }[] | number[];
        showRowsPerPage?: boolean;
      });
  rowDragHandle?:
    | ((props: {
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Button>)
    | React.ComponentProps<typeof Button>;
  searchInput?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Input>)
    | React.ComponentProps<typeof Input>;
  selectAllCheckbox?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Checkbox>)
    | React.ComponentProps<typeof Checkbox>;
  selectCheckbox?:
    | ((props: {
        row: SST_Row<TData>;
        staticRowIndex?: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Checkbox>)
    | React.ComponentProps<typeof Checkbox>;
  skeleton?:
    | ((props: {
        cell: SST_Cell<TData>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<typeof Skeleton>)
    | React.ComponentProps<typeof Skeleton>;
  spinner?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Spinner>)
    | React.ComponentProps<typeof Spinner>;
  table?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'table'>)
    | React.ComponentProps<'table'>;
  tableBody?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'tbody'>)
    | React.ComponentProps<'tbody'>;
  tableBodyCell?:
    | ((props: {
        cell: SST_Cell<TData>;
        column: SST_Column<TData>;
        row: SST_Row<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'td'>)
    | React.ComponentProps<'td'>;
  tableBodyRow?:
    | ((props: {
        isDetailPanel?: boolean;
        row: SST_Row<TData>;
        staticRowIndex: number;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'tr'>)
    | React.ComponentProps<'tr'>;
  tableContainer?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
    | React.ComponentProps<'div'>;
  tableFooter?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'tfoot'>)
    | React.ComponentProps<'tfoot'>;
  tableFooterCell?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'td'>)
    | React.ComponentProps<'td'>;
  tableFooterRow?:
    | ((props: {
        footerGroup: SST_HeaderGroup<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'tr'>)
    | React.ComponentProps<'tr'>;
  tableHead?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'thead'>)
    | React.ComponentProps<'thead'>;
  tableHeadCell?:
    | ((props: {
        column: SST_Column<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'th'>)
    | React.ComponentProps<'th'>;
  tableHeadRow?:
    | ((props: {
        headerGroup: SST_HeaderGroup<TData>;
        table: SST_TableInstance<TData>;
      }) => React.ComponentProps<'tr'>)
    | React.ComponentProps<'tr'>;
  tablePaper?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
    | React.ComponentProps<'div'>;
  toolbarAlertBanner?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Alert>)
    | React.ComponentProps<typeof Alert>;
  toolbarAlertBannerChip?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<typeof Badge>)
    | React.ComponentProps<typeof Badge>;
  topToolbar?:
    | ((props: { table: SST_TableInstance<TData> }) => React.ComponentProps<'div'>)
    | React.ComponentProps<'div'>;
};
