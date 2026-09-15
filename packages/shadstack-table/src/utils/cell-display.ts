import { isValidElement, type ReactNode } from 'react';

type ScalarDisplayValue = string | number | bigint | boolean | null | undefined;

const isScalarDisplayValue = <TValue>(value: TValue): value is TValue & ScalarDisplayValue =>
  value === null ||
  value === undefined ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'bigint' ||
  typeof value === 'boolean';

/** Default cells display primitives and React elements directly. Other values use their text form. */
export function getDefaultCellValue<TValue>(value: TValue): ReactNode {
  if (isScalarDisplayValue(value) || isValidElement(value)) return value;

  return String(value);
}
