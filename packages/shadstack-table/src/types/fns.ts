import { type AggregationFn, type FilterFn, type SortingFn } from '@tanstack/react-table';
import { type SST_AggregationFns } from '../fns/aggregationFns';
import { type SST_FilterFns } from '../fns/filterFns';
import { type SST_SortingFns } from '../fns/sortingFns';
import { type LiteralUnion } from './primitives';
import { type SST_RowData } from './row';

export type SST_AggregationOption = string & keyof typeof SST_AggregationFns;

export type SST_AggregationFn<TData extends SST_RowData> =
  | AggregationFn<TData>
  | SST_AggregationOption;

export type SST_SortingOption = LiteralUnion<string & keyof typeof SST_SortingFns>;

export type SST_SortingFn<TData extends SST_RowData> = SST_SortingOption | SortingFn<TData>;

export type SST_FilterOption = LiteralUnion<string & keyof typeof SST_FilterFns>;

export type SST_FilterFn<TData extends SST_RowData> = FilterFn<TData> | SST_FilterOption;

export type SST_InternalFilterOption = {
  divider: boolean;
  label: string;
  option: string;
  symbol: string;
};

export type SST_ColumnFilterFnsState = Record<string, SST_FilterOption>;
