# shadstack-table

A shadcn/ui-native React data table with the same feature surface as [`material-react-table`](https://github.com/KevinVandy/material-react-table) — minus the MUI dependency. Built on TanStack Table v8 + TanStack Virtual.

> **Status: pre-1.0.** Feature-complete fork — the initial port of every MRT feature is shipped and the build is clean (lint / format / typecheck / build / tests all green). Not yet on npm. Stabilization, deeper tests, and the new docs site (Astro + Starlight at `apps/docs/`) come before a 1.0 tag.

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
5. Apply the `muiXxxProps` → `slotProps.xxx` rename pass (one-to-one mapping, documented in [PORT_PLAN.md](./PORT_PLAN.md)).

## v1 scope

Feature parity targets, in the order they matter:

- Sort, filter, paginate, row select, expand
- Column visibility, pinning, density toggle, column resize
- Virtualization (TanStack Virtual)
- Cell editing modes (modal + inline)

See [GOAL.md](./GOAL.md) for the full scope, non-goals, architectural principles, and post-v1 future work (test suite, react-doctor, enforced CI gates).

## Stack

| Layer           | Choice                                          |
| --------------- | ----------------------------------------------- |
| Engine          | `@tanstack/react-table` v8                      |
| Virtualization  | `@tanstack/react-virtual`                       |
| UI primitives   | Radix UI via shadcn-style wrappers              |
| Icons           | lucide-react                                    |
| Styling         | Tailwind CSS v4 + `tw-animate-css`              |
| Bundler         | Vite 7 (library mode)                           |
| Package manager | Bun 1.3 (workspaces)                            |
| Lint / format   | oxlint, oxfmt                                   |
| Lang            | TypeScript 5.9 (strict, `verbatimModuleSyntax`) |

## Repo layout

```
shadstack-table/
├── packages/
│   └── shadstack-table/    # the library
│       └── src/
│           ├── _ui/        # shadcn primitives (Radix wrappers)
│           ├── components/ # SST_* table components (body / buttons / footer / head / inputs / menus / modals / table / toolbar)
│           ├── fns/        # filter / sort / aggregation fns
│           ├── hooks/      # useShadStackTable + internal hooks
│           ├── locales/    # 39 locales
│           ├── utils/      # cell / column / row / style utilities
│           ├── icons.ts
│           ├── types.ts
│           └── index.ts
├── apps/
│   └── playground/         # Vite + React 19 dev sandbox / smoke test
├── GOAL.md                 # product goal, principles, non-goals, future work
├── PORT_PLAN.md            # architecture & contributor reference (MUI→shadcn mapping, quirks, decisions)
└── LICENSE                 # MIT, with material-react-table attribution
```

## Local development

Bun is the package manager — `bun install` is constrained by `minimum-release-age: 864000s` (10-day supply-chain guard).

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
