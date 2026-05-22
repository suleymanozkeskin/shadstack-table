# shadstack-table

A shadcn/ui-native React data table that follows the [`material-react-table`](https://github.com/KevinVandy/material-react-table) API direction — minus the MUI dependency — with a small set of [known deferred features](#v1-deferred-features). Built on TanStack Table v8 + TanStack Virtual.

**👉 [Documentation & live demo](https://suleymanozkeskin.github.io/shadstack-table/)** · [GitHub](https://github.com/suleymanozkeskin/shadstack-table) · [Changelog](https://github.com/suleymanozkeskin/shadstack-table/blob/main/CHANGELOG.md)

> **Status: pre-1.0.** MRT-compatible API direction is in place; a small set of features are deferred (see [v1 deferred features](#v1-deferred-features) below). API is stable in shape but may receive breaking refinements before 1.0.

## Install

```bash
bun add shadstack-table
# or
npm install shadstack-table
```

Peer dependencies: `react` and `react-dom` `>=18`. shadstack-table also depends on `@tanstack/react-table` v8, `@tanstack/react-virtual` v3, `tailwindcss` v4, `tw-animate-css`, and a set of `@radix-ui/*` primitives — install those alongside if your project doesn't already use them.

### CSS setup (Tailwind v4)

As of 0.1.4 the library no longer ships a full Tailwind utility bundle (that broke consumer cascades — see CHANGELOG). Instead, your own Tailwind build scans the library source for the utility classes its components use, and you import a small library-specific stylesheet for tokens and component CSS.

In your app's globals.css:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

/* path is relative to globals.css */
@source '../node_modules/shadstack-table/dist';

@custom-variant dark (&:is(.dark *));

/* Map the library's CSS tokens onto Tailwind v4's named-color theme so
   utilities like `bg-background`, `border-border`, `text-foreground` resolve. */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
}

/* shadcn baseline — every element borrows the theme `--border` / `--ring`. */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
```

If you ran `shadcn init` already, the `@theme inline` and `@layer base` blocks are in your `globals.css` from that step — leave them. The token _values_ (`--background: oklch(1 0 0)` etc.) are provided by `shadstack-table/style.css`, so anything you don't override falls through to the library's shadcn-neutral defaults. Without the `@theme inline` block, Tailwind utilities like `bg-background` and `border-border` are unknown classes and the table renders unstyled.

And once at your app entry:

```ts
import 'shadstack-table/style.css';
```

The imported `style.css` is ~5 KB and contains only shadcn token defaults (wrapped in `:where()` so your tokens win automatically), table-scoped scrollbar styles, the keyboard-focus ring, and the pinned-cell overlay. No Tailwind utilities, no preflight — your Tailwind build owns those, exactly once, in a cascade position you control.

### Upgrading from 0.1.3 or earlier

If you upgraded from 0.1.0–0.1.3 and previously relied on `import 'shadstack-table/style.css'` alone, add the `@source` line above to your globals.css and add `@import 'tw-animate-css'` if you don't already. Without `@source`, the library's components render but utility classes won't be generated.

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

## API stability

Pre-1.0, exports are classified into three tiers. Anything not listed under **Stable** may change without a major bump.

### Stable

The public surface we intend to keep working through 1.x. Consumers should rely only on these:

- **Components:** `ShadStackTable`
- **Hooks:** `useShadStackTable`
- **Helpers:** `createSSTColumnHelper`, `flexRender`, `createRow`
- **Types:** `SST_ColumnDef`, `SST_TableOptions`, `SST_TableInstance`, `SST_Row`, `SST_RowData`, `SST_Header`, `SST_Column`, `SST_Localization`, `SST_Theme`, `SST_RowSelectionState`, `SST_SortingState`, `SST_ColumnFiltersState`, `SST_PaginationState`, `SST_ColumnPinningState`, `SST_RowPinningState`, `SST_ExpandedState`, `SST_VisibilityState`, `SST_GroupingState`, `SST_ColumnOrderState`, `SST_ColumnSizingState`, `SST_ColumnSizingInfoState`
- **Options:** every documented field on `SST_TableOptions` (toggles, callbacks, `theme`, `localization`, `slotProps`, etc.)
- **Localization subpaths:** `shadstack-table/locales/<code>` — see [Localization](https://suleymanozkeskin.github.io/shadstack-table/guides/localization/)
- **Style entry:** `shadstack-table/style.css`

### Deprecated (compatibility aliases)

Still exported and working; emit JSDoc deprecation warnings in your editor and will be removed in a future major:

- `createMRTColumnHelper` → use `createSSTColumnHelper`
- `mrtTheme` option → use `theme`
- `getMRTTheme` → use `getSST_Theme`

### Internal / unstable

Currently re-exported from the package barrel for ergonomic access, but **not part of the stable surface**. These can change shape, move, or disappear without a major bump:

- Every `SST_*` component other than `ShadStackTable` (the head, body, footer, toolbar, menu, button, input, modal pieces under `src/components/*`)
- Every `Memo_*` component
- Every `useSST_*` hook other than `useShadStackTable`
- Every utility under `src/utils/` (cell, column, display-column, row helpers, style.utils)
- The aggregation/filter/sorting `*Fns` collections

If you find yourself reaching for one of these, please open an issue describing the use case — that helps us decide what should be promoted to the stable tier before 1.0.

### Size budget

CI gates the published build against gzip-size budgets enforced in [`apps/consumer-fixture/verify.mjs`](../../apps/consumer-fixture/verify.mjs): `dist/index.js` ≤ 60 kB, `dist/index.cjs` ≤ 62 kB, `dist/style.css` ≤ 3 kB, and each `dist/locales/*.js` ≤ 3 kB gzip, with the locale directory capped at 220 kB raw bytes total. If a change trips one of these, investigate the diff before adjusting the number — the budget is the gate.

## v1 deferred features

A small set of MRT features are deferred to a later minor:

- `filterVariant: 'autocomplete'` — falls back to a text input with a one-time `console.warn`.
- Column drag-reorder — not in v1; column resize and pinning are supported.
- `filterVariant: 'time' | 'datetime' | 'time-range' | 'datetime-range'` — use a native `<input>` until a shadcn time picker recipe exists. `date` and `date-range` already use shadcn `Popover` + `Calendar`.

## Acknowledgements

Built on the design and engineering of [`material-react-table`](https://github.com/KevinVandy/material-react-table) by [Kevin Vandy](https://github.com/KevinVandy). The original MIT copyright is reproduced in [LICENSE](./LICENSE).

## License

[MIT](./LICENSE).
