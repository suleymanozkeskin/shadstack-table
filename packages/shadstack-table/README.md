# shadstack-table

A shadcn/ui-native React data table with the same feature surface as [`material-react-table`](https://github.com/KevinVandy/material-react-table) — minus the MUI dependency. Built on TanStack Table v8 + TanStack Virtual.

**👉 [Documentation & live demo](https://suleymanozkeskin.github.io/shadstack-table/)** · [GitHub](https://github.com/suleymanozkeskin/shadstack-table) · [Changelog](https://github.com/suleymanozkeskin/shadstack-table/blob/main/CHANGELOG.md)

> **Status: pre-1.0.** The full MRT feature surface is ported; API is stable in shape but may receive breaking refinements before 1.0.

## Install

```bash
bun add shadstack-table
# or
npm install shadstack-table
```

Peer dependencies: `react` and `react-dom` `>=18`. shadstack-table also depends on `@tanstack/react-table` v8, `@tanstack/react-virtual` v3, `tailwindcss` v4, and a set of `@radix-ui/*` primitives — install those alongside if your project doesn't already use them.

Import the stylesheet once at your app entry:

```ts
import 'shadstack-table/style.css';
```

## Quick start

```tsx
import { useMemo } from 'react';
import { ShadStackTable, useShadStackTable, type SST_ColumnDef } from 'shadstack-table';

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

## Migrating from `material-react-table`

The consumer-facing rename is one-to-one:

```diff
- import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
+ import { ShadStackTable,    useShadStackTable,    type SST_ColumnDef } from 'shadstack-table';
```

1. Rename `MaterialReactTable` → `ShadStackTable`, `useMaterialReactTable` → `useShadStackTable`.
2. Find-replace the `MRT_*` type prefix with `SST_*`.
3. Replace built-in column IDs (`'mrt-row-select'`, `'mrt-row-actions'`, `'mrt-row-expand'`, `'mrt-row-drag'`, `'mrt-row-numbers'`, `'mrt-row-pin'`, `'mrt-row-spacer'`) — swap the `mrt-` prefix for `sst-`.
4. Apply the `muiXxxProps` → `slotProps.xxx` rename pass — every MUI-prefixed slot prop is now under `slotProps` (e.g. `muiTableBodyRowProps` → `slotProps.tableBodyRow`).

## v1 deferred features

A small set of MRT features are deferred to a later minor:

- `filterVariant: 'autocomplete'` — falls back to a text input with a one-time `console.warn`.
- Column drag-reorder — not in v1; column resize and pinning are supported.
- `filterVariant: 'time' | 'datetime' | 'time-range' | 'datetime-range'` — use a native `<input>` until a shadcn time picker recipe exists. `date` and `date-range` already use shadcn `Popover` + `Calendar`.

## Acknowledgements

Built on the design and engineering of [`material-react-table`](https://github.com/KevinVandy/material-react-table) by [Kevin Vandy](https://github.com/KevinVandy). The original MIT copyright is reproduced in [LICENSE](./LICENSE).

## License

[MIT](./LICENSE).
