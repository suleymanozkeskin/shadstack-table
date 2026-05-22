# shadstack-table

A shadcn/ui-native React data table that follows the [`material-react-table`](https://github.com/KevinVandy/material-react-table) API direction — minus the MUI dependency. Built on TanStack Table v8 + TanStack Virtual.

**👉 [Documentation & live demo](https://suleymanozkeskin.github.io/shadstack-table/)** · [GitHub](https://github.com/suleymanozkeskin/shadstack-table) · [Changelog](https://github.com/suleymanozkeskin/shadstack-table/blob/main/CHANGELOG.md)

> **Status: pre-1.0.** The MRT-compatible API surface is in place; a small set of features are deferred. The API is stable in shape but may receive breaking refinements before 1.0.

## Install

```bash
bun add shadstack-table
# or
npm install shadstack-table
```

Peer dependencies: `react` and `react-dom` `>=18`, plus a Tailwind v4 build (see CSS setup below).

## Quick start

```tsx
import { useMemo } from 'react';
import { ShadStackTable, useShadStackTable, type SST_ColumnDef } from 'shadstack-table';
import 'shadstack-table/style.css';

type Person = { name: string; age: number; email: string };

const data: Person[] = [
  { name: 'Ada Lovelace', age: 36, email: 'ada@example.com' },
  { name: 'Alan Turing', age: 41, email: 'alan@example.com' },
];

export function PeopleTable() {
  const columns = useMemo<SST_ColumnDef<Person>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'age', header: 'Age', filterVariant: 'range' },
      { accessorKey: 'email', header: 'Email' },
    ],
    [],
  );

  const table = useShadStackTable({ columns, data });
  return <ShadStackTable table={table} />;
}
```

## Tailwind setup

This library expects Tailwind v4 in the consuming app. Without an `@source` directive and the matching `@theme inline` block in your `globals.css`, the table renders unstyled. The full snippet is in [Getting started → CSS setup](https://suleymanozkeskin.github.io/shadstack-table/getting-started/#wire-tailwind-to-scan-the-library).

## Migrating from `material-react-table`

```diff
- import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
+ import { ShadStackTable,    useShadStackTable,    type SST_ColumnDef } from 'shadstack-table';
```

Full step-by-step (component rename, `MRT_*` → `SST_*` types, `mrt-` → `sst-` column IDs, `muiXxxProps` → `slotProps`) lives in [Migrating from material-react-table](https://suleymanozkeskin.github.io/shadstack-table/guides/migrating-from-mrt/).

## Deferred features

A small set of MRT features are deferred to a later minor:

- `filterVariant: 'autocomplete'` — falls back to a text input with a one-time `console.warn`.
- `filterVariant: 'time' | 'datetime' | 'time-range' | 'datetime-range'` — native `<input>` until a shadcn time picker recipe lands. `date` and `date-range` already use shadcn `Popover` + `Calendar`.

## API stability

The public surface is split into Stable / Deprecated / Internal tiers and the package ships under a gzip size budget. See [API stability](https://suleymanozkeskin.github.io/shadstack-table/guides/api-stability/) for the full list and budgets.

## Acknowledgements

Built on the design and engineering of [`material-react-table`](https://github.com/KevinVandy/material-react-table) by [Kevin Vandy](https://github.com/KevinVandy). The original MIT copyright is reproduced in [LICENSE](./LICENSE).

## License

[MIT](./LICENSE).
