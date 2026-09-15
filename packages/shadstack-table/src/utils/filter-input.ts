export type FilterScalar = Date | number | string | null | undefined;

export type FilterInputValue = FilterScalar | string[];

export type FilterRangeValue = [FilterScalar, FilterScalar];

/** Checks values supplied through the external column-filter state. */
export const isFilterScalar = (value: unknown): value is FilterScalar =>
  value === undefined ||
  value === null ||
  (value instanceof Date && Number.isFinite(value.getTime())) ||
  typeof value === 'string' ||
  (typeof value === 'number' && Number.isFinite(value));

const isStringValue = (value: unknown): value is string => typeof value === 'string';

export const isFilterInputValue = (value: unknown): value is FilterInputValue =>
  isFilterScalar(value) || (Array.isArray(value) && value.every(isStringValue));

export const isFilterRangeValue = (value: unknown): value is FilterRangeValue =>
  Array.isArray(value) && value.length === 2 && value.every(isFilterScalar);

/** Range sliders accept exactly two finite numeric bounds. */
export const isNumericFilterRange = (value: unknown): value is [number, number] =>
  Array.isArray(value) && value.length === 2 && value.every(isFiniteNumber);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
