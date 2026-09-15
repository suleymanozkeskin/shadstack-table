import { type DropdownOption } from '../types';

export const parseFromValuesOrFunc = <T, U>(
  fn: ((arg: U) => T) | T | undefined,
  arg: U,
): T | undefined => (fn instanceof Function ? fn(arg) : fn);

type DropdownValue = Readonly<{ label: string; value: string }>;

const isDropdownRecord = (option: DropdownOption): option is Exclude<DropdownOption, string> =>
  typeof option === 'object';

/** Converts a dropdown option to the strings required by a Select control. */
export const getValueAndLabel = (option?: DropdownOption | null): DropdownValue => {
  if (!option) return { label: '', value: '' };

  if (isDropdownRecord(option)) {
    const value = String(option.value);

    return { label: option.label ?? value, value };
  }

  return { label: option, value: option };
};
