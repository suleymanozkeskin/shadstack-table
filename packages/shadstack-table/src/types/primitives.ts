import { type Updater } from '@tanstack/react-table';

export type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;

export type Xor<A, B> =
  | Prettify<A & { [k in keyof B]?: never }>
  | Prettify<B & { [k in keyof A]?: never }>;

export type DropdownOption =
  | {
      label?: string;
      value: any;
    }
  | string;

export type SST_DensityState = 'comfortable' | 'compact' | 'spacious';

export type SST_Updater<T> = Updater<T>;
