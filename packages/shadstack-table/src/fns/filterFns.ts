import { rankItem, rankings } from '@tanstack/match-sorter-utils';
import { type ExtractFilterMeta, type Row, filterFns } from '@tanstack/react-table';
import { type SST_RowData } from '../types';

const fuzzy = <TData extends SST_RowData>(
  row: Row<any, TData>,
  columnId: string,
  filterValue: number | string,
  // TanStack v9 declares `addMeta` as optional on `FilterFn` and types the
  // payload from the feature set's `filterMeta` slot. Both are required for
  // this function to be assignable to the `filterFns` registry.
  addMeta?: (item: ExtractFilterMeta<any>) => void,
): boolean => {
  const itemRank = rankItem(row.getValue<string | number | null>(columnId), filterValue as string, {
    threshold: rankings.MATCHES,
  });
  addMeta?.(itemRank);
  return itemRank.passed;
};

fuzzy.autoRemove = (val: any) => !val;

const contains = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !!row
    .getValue<number | string | null>(id)
    ?.toString()
    .toLowerCase()
    .trim()
    .includes(filterValue.toString().toLowerCase().trim());

contains.autoRemove = (val: any) => !val;

const startsWith = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !!row
    .getValue<number | string | null>(id)
    ?.toString()
    .toLowerCase()
    .trim()
    .startsWith(filterValue.toString().toLowerCase().trim());

startsWith.autoRemove = (val: any) => !val;

const endsWith = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !!row
    .getValue<number | string | null>(id)
    ?.toString()
    .toLowerCase()
    .trim()
    .endsWith(filterValue.toString().toLowerCase().trim());

endsWith.autoRemove = (val: any) => !val;

const equals = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  row.getValue<number | string | null>(id)?.toString().toLowerCase().trim() ===
  filterValue.toString().toLowerCase().trim();

equals.autoRemove = (val: any) => !val;

const notEquals = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  row.getValue<number | string | null>(id)?.toString().toLowerCase().trim() !==
  filterValue.toString().toLowerCase().trim();

notEquals.autoRemove = (val: any) => !val;

const greaterThan = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !isNaN(+filterValue) && !isNaN(+row.getValue<number | string>(id))
    ? +(row.getValue<number | string | null>(id) ?? 0) > +filterValue
    : (row.getValue<number | string | null>(id) ?? '')?.toString().toLowerCase().trim() >
      filterValue.toString().toLowerCase().trim();

greaterThan.autoRemove = (val: any) => !val;

const greaterThanOrEqualTo = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean => equals(row, id, filterValue) || greaterThan(row, id, filterValue);

greaterThanOrEqualTo.autoRemove = (val: any) => !val;

const lessThan = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !isNaN(+filterValue) && !isNaN(+row.getValue<number | string>(id))
    ? +(row.getValue<number | string | null>(id) ?? 0) < +filterValue
    : (row.getValue<number | string | null>(id) ?? '')?.toString().toLowerCase().trim() <
      filterValue.toString().toLowerCase().trim();

lessThan.autoRemove = (val: any) => !val;

const lessThanOrEqualTo = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValue: number | string,
): boolean => equals(row, id, filterValue) || lessThan(row, id, filterValue);

lessThanOrEqualTo.autoRemove = (val: any) => !val;

const between = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValues: [number | string, number | string],
): boolean =>
  ((['', undefined] as any[]).includes(filterValues[0]) || greaterThan(row, id, filterValues[0])) &&
  ((!isNaN(+filterValues[0]) && !isNaN(+filterValues[1]) && +filterValues[0] > +filterValues[1]) ||
    (['', undefined] as any[]).includes(filterValues[1]) ||
    lessThan(row, id, filterValues[1]));

between.autoRemove = (val: any) => !val;

const betweenInclusive = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValues: [number | string, number | string],
): boolean =>
  ((['', undefined] as any[]).includes(filterValues[0]) ||
    greaterThanOrEqualTo(row, id, filterValues[0])) &&
  ((!isNaN(+filterValues[0]) && !isNaN(+filterValues[1]) && +filterValues[0] > +filterValues[1]) ||
    (['', undefined] as any[]).includes(filterValues[1]) ||
    lessThanOrEqualTo(row, id, filterValues[1]));

betweenInclusive.autoRemove = (val: any) => !val;

const empty = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  _filterValue: number | string,
): boolean => !row.getValue<number | string | null>(id)?.toString().trim();

empty.autoRemove = (val: any) => !val;

const notEmpty = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  _filterValue: number | string,
): boolean => !!row.getValue<number | string | null>(id)?.toString().trim();

notEmpty.autoRemove = (val: any) => !val;

/**
 * Multi-select matching: a row passes when its value is one of the selected
 * options, or — for array-valued columns — shares any member with them.
 *
 * This shadows TanStack's built-in of the same name, which in v9 returns
 * `false` outright unless the row value is an array. shadstack applies this fn
 * to scalar columns too — `getDefaultColumnFilterFn` maps `multi-select` to it
 * — so the built-in alone would filter every row away.
 *
 * Scalar columns match on equality. The v8 implementation delegated to the row
 * value's own `.includes`, which on a string is a substring test, so selecting
 * `'Engineer'` also matched `'Engineering Manager'`. Options come from a fixed
 * list, so equality is what selecting one of them means.
 */
const arrIncludesSome = <TData extends SST_RowData>(
  row: Row<any, TData>,
  id: string,
  filterValues: unknown[],
): boolean => {
  const value = row.getValue(id);
  return Array.isArray(value)
    ? filterValues.some((filterValue) => value.includes(filterValue))
    : filterValues.some((filterValue) => filterValue === value);
};

arrIncludesSome.autoRemove = (val: any) => !val || !val.length;

export const SST_FilterFns = {
  ...filterFns,
  arrIncludesSome,
  between,
  betweenInclusive,
  contains,
  empty,
  endsWith,
  equals,
  fuzzy,
  greaterThan,
  greaterThanOrEqualTo,
  lessThan,
  lessThanOrEqualTo,
  notEmpty,
  notEquals,
  startsWith,
};
