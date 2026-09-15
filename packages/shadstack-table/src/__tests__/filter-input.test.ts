import { describe, expect, it } from 'vitest';
import {
  isNumericFilterRange,
  isFilterInputValue,
  isFilterRangeValue,
  isFilterScalar,
} from '../utils/filter-input';

describe('built-in filter input values', () => {
  it('accepts empty values, text, finite numbers, and valid dates', () => {
    for (const value of [undefined, null, '', 'text', 0, 42, new Date('2026-01-01')]) {
      expect(isFilterScalar(value)).toBe(true);
    }
  });

  it('rejects invalid dates, non-finite numbers, and unsupported objects', () => {
    for (const value of [new Date('invalid'), NaN, Infinity, {}, true]) {
      expect(isFilterScalar(value)).toBe(false);
    }
  });

  it('accepts string selections and rejects mixed selections', () => {
    expect(isFilterInputValue([])).toBe(true);
    expect(isFilterInputValue(['a', 'b'])).toBe(true);
    expect(isFilterInputValue(['a', 1])).toBe(false);
  });

  it('accepts only finite numeric pairs for sliders', () => {
    expect(isNumericFilterRange([0, 10])).toBe(true);
    expect(isNumericFilterRange([0, Infinity])).toBe(false);
    expect(isNumericFilterRange(['0', 10])).toBe(false);
    expect(isNumericFilterRange([0])).toBe(false);
  });

  it('requires exactly two supported range bounds', () => {
    expect(isFilterRangeValue([0, 10])).toBe(true);
    expect(isFilterRangeValue([undefined, new Date('2026-01-01')])).toBe(true);
    expect(isFilterRangeValue([])).toBe(false);
    expect(isFilterRangeValue([0, 1, 2])).toBe(false);
    expect(isFilterRangeValue([0, {}])).toBe(false);
  });
});
