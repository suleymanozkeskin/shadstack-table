# shadstack-table

A shadcn/ui-native React data table — the same feature surface as [`material-react-table`](https://github.com/KevinVandy/material-react-table) without the MUI dependency. Built on TanStack Table v8 + TanStack Virtual.

**[Docs & live demo](https://suleymanozkeskin.github.io/shadstack-table/)** · [npm](https://www.npmjs.com/package/shadstack-table) · [Changelog](./CHANGELOG.md)

## Why

`material-react-table` is the most feature-complete TanStack Table v8 wrapper in the React ecosystem — but it's been unmaintained for ~8 months as of 2026 and ships MUI as a hard dependency. `shadstack-table` is a fork that swaps the MUI surface for shadcn primitives (Radix UI + Tailwind v4 + lucide-react), keeping the MRT-compatible API direction with a small set of [deferred features](https://suleymanozkeskin.github.io/shadstack-table/getting-started/) flagged for later minors.

Migration from MRT is a near-mechanical rename pass — see [Migrating from material-react-table](https://suleymanozkeskin.github.io/shadstack-table/guides/migrating-from-mrt/).

## Repo layout

This is a bun workspace monorepo:

```
packages/shadstack-table/   the published library
apps/playground/            local dev surface; the docs site embeds it
apps/docs/                  Starlight docs site (deployed via GitHub Pages)
apps/bench/                 render benchmarks (workflow_dispatch)
apps/e2e/                   Playwright smoke
apps/consumer-fixture/      verifies the packed npm tarball
```

## Contributing

```bash
bun install
bun run dev          # playground at http://localhost:5173
bun run dev:docs     # docs site
bun run test         # vitest
bun run typecheck    # all workspaces
bun run verify:package
```

The 0.x maintenance work lands on the `maintenance` branch first. The `main` branch is promoted from `maintenance` at release time.

## Acknowledgements

Built on the design and engineering of [`material-react-table`](https://github.com/KevinVandy/material-react-table) by [Kevin Vandy](https://github.com/KevinVandy). MRT remains MIT-licensed; the original copyright and license are reproduced in [LICENSE](./LICENSE).

## License

[MIT](./LICENSE).
