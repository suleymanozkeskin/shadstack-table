# shadstack-table

The most feature-complete React data table built on shadcn/ui components, with the performance of TanStack Table v9.

**[Docs & live demo](https://suleymanozkeskin.github.io/shadstack-table/)** · [npm](https://www.npmjs.com/package/shadstack-table) · [Changelog](./CHANGELOG.md)

## Why

[`material-react-table`](https://github.com/KevinVandy/material-react-table) is the most complete React data table ever shipped — but it ships MUI as a hard dependency and is no longer maintained upstream. `shadstack-table` carries that feature surface over to shadcn primitives (Radix UI + Tailwind v4 + lucide-react), keeping the MRT-compatible API direction. Migration from MRT is a near-mechanical rename pass — see [Migrating from material-react-table](https://suleymanozkeskin.github.io/shadstack-table/guides/migrating-from-mrt/).

Since 0.3.0 the engine is TanStack Table v9, and its render granularity is the default: every state slice lives in the table's store atoms and every internal component subscribes to exactly the state it renders. A state write re-renders only its subscribers — hovering a row during a drag re-renders that row alone, entering cell editing re-renders that cell alone, a page flip leaves every header cell untouched — and interaction cost does not grow with table size.

## Quick start

```bash
bun add shadstack-table
```

```tsx
import { ShadStackTable, useShadStackTable } from 'shadstack-table';
import 'shadstack-table/style.css';

const table = useShadStackTable({ columns, data });
return <ShadStackTable table={table} />;
```

Full setup — including the Tailwind v4 `@source` / `@theme inline` wiring the styles depend on — is in [Getting started](https://suleymanozkeskin.github.io/shadstack-table/getting-started/).

## Acknowledgements

Built on the design and engineering of [`material-react-table`](https://github.com/KevinVandy/material-react-table) by [Kevin Vandy](https://github.com/KevinVandy). MRT remains MIT-licensed; the original copyright and license are reproduced in [LICENSE](./LICENSE).

## License

[MIT](./LICENSE).
