# shadstack-table

A shadcn/ui-native React data table with the same feature surface as [`material-react-table`](https://github.com/KevinVandy/material-react-table) — minus the MUI dependency. Built on TanStack Table v8 + TanStack Virtual.

> **Status: 0.1.0 on npm — pre-1.0.** The full MRT feature surface is ported; API shape is stable but may still get breaking refinements before 1.0. Install with `bun add shadstack-table` (or `npm install shadstack-table`).

**[Docs](https://suleymanozkeskin.github.io/shadstack-table/)** · [npm](https://www.npmjs.com/package/shadstack-table) · [Changelog](./CHANGELOG.md)

## Why

`material-react-table` is the most feature-complete table for TanStack Table v8 in the React ecosystem. As of 2026 it has been unmaintained for ~8 months and is tightly coupled to Material UI v6, which makes it a non-starter for projects on shadcn/ui or any non-MUI design system. `shadstack-table` is a fork that swaps the MUI surface for shadcn primitives (Radix UI + Tailwind v4 + lucide-react) while keeping every feature, every option, and every public type that MRT consumers depend on.

If you're migrating from MRT, the consumer-facing change is roughly:

```diff
- import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
+ import { ShadStackTable,    useShadStackTable,    type SST_ColumnDef } from 'shadstack-table';
```

So:

1. Rename the package.
2. Rename `MaterialReactTable` → `ShadStackTable` (and `useMaterialReactTable` → `useShadStackTable`).
3. Find-replace the `MRT_*` type prefix with `SST_*`.
4. Find-replace the built-in column IDs (`'mrt-row-select'`, `'mrt-row-actions'`, `'mrt-row-expand'`, `'mrt-row-drag'`, `'mrt-row-numbers'`, `'mrt-row-pin'`, `'mrt-row-spacer'`) — replace the `mrt-` prefix with `sst-` anywhere they appear in `state.columnOrder`, `state.columnPinning`, custom column ordering logic, etc.
5. Apply the `muiXxxProps` → `slotProps.xxx` rename pass — every MUI-prefixed slot prop is now under `slotProps`.

## Feature surface

- Sort, filter, paginate, row select, expand
- Column visibility, pinning, density toggle, column resize
- Virtualization (TanStack Virtual)
- Cell editing modes (modal + inline)

**Deferred to a later minor:** `filterVariant: 'autocomplete'` (falls back to text input with a one-time `console.warn`), column drag-reorder, and `filterVariant: 'time' | 'datetime' | 'time-range' | 'datetime-range'` (native `<input>` until a shadcn time picker recipe lands). `date` and `date-range` use shadcn `Popover` + `Calendar`.

## Local development

Bun is the package manager — `bun install` is constrained by `minimum-release-age: 604800s` (7-day supply-chain guard).

```bash
bun install
bun run dev          # starts the playground at http://localhost:5173
bun run build        # builds the library (dist/index.{js,cjs,d.ts} + dist/style.css)
bun run lint         # oxlint
bun run format       # oxfmt write
bun run format:check # oxfmt check (CI-equivalent)
bun run typecheck    # tsc --noEmit across both workspaces
bun run test         # vitest run (smoke tests for v1 priority features)
bun run test:coverage # vitest run --coverage (V8 reporter)
```

CI runs the full `lint / format:check / typecheck / test / build` chain on every PR and push to `main`.

## Acknowledgements

Built on the design and engineering of [`material-react-table`](https://github.com/KevinVandy/material-react-table) by [Kevin Vandy](https://github.com/KevinVandy). MRT remains MIT-licensed; the original copyright and license are reproduced in [LICENSE](./LICENSE) as required.

## License

[MIT](./LICENSE).
