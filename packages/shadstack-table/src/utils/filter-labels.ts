import { type SST_FilterOption, type SST_Localization } from '../types';

const filterLabelKeys = new Map<SST_FilterOption, keyof SST_Localization>([
  ['arrIncludes', 'filterArrIncludes'],
  ['arrIncludesAll', 'filterArrIncludesAll'],
  ['arrIncludesSome', 'filterArrIncludesSome'],
  ['between', 'filterBetween'],
  ['betweenInclusive', 'filterBetweenInclusive'],
  ['contains', 'filterContains'],
  ['empty', 'filterEmpty'],
  ['endsWith', 'filterEndsWith'],
  ['equals', 'filterEquals'],
  ['equalsString', 'filterEqualsString'],
  ['fuzzy', 'filterFuzzy'],
  ['greaterThan', 'filterGreaterThan'],
  ['greaterThanOrEqualTo', 'filterGreaterThanOrEqualTo'],
  ['inNumberRange', 'filterInNumberRange'],
  ['includesString', 'filterIncludesString'],
  ['includesStringSensitive', 'filterIncludesStringSensitive'],
  ['lessThan', 'filterLessThan'],
  ['lessThanOrEqualTo', 'filterLessThanOrEqualTo'],
  ['notEmpty', 'filterNotEmpty'],
  ['notEquals', 'filterNotEquals'],
  ['startsWith', 'filterStartsWith'],
  ['weakEquals', 'filterWeakEquals'],
]);

/** Custom filter modes without a built-in label return an empty label. */
export const getFilterLabel = (
  localization: SST_Localization,
  option: SST_FilterOption,
): string => {
  const key = filterLabelKeys.get(option);

  return key === undefined ? '' : (localization[key] ?? '');
};
