# Changelog

All notable changes to `shadstack-table` are recorded here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.6] — 2026-05-18

Fixes a packaging bug: `dist/index.{js,cjs}` imported 21 packages that were marked external in the rollup config but never declared in `package.json`. They only resolved when the consumer's `node_modules` happened to contain them transitively — a clean install of just `shadstack-table` broke at runtime.

### Fixed

- Declared every runtime import as a real dependency: all 14 `@radix-ui/*` primitives in use, `@tanstack/match-sorter-utils`, `class-variance-authority`, `clsx`, `date-fns`, `lucide-react`, `react-day-picker`, `tailwind-merge`. `react` / `react-dom` remain peers; `@tanstack/react-table` and `@tanstack/react-virtual` remain in `dependencies` as before.
- Externalized `date-fns` and `react-day-picker` in the rollup config (they were being bundled). `dist/index.js` dropped from ~501 KB to ~248 KB (CJS: ~523 → ~269 KB); gzip dropped from ~110 KB to ~53 KB.

## [0.1.5] — 2026-05-18

Drops the `highlight-words` runtime dependency by vendoring its ~30 LOC into the library. No behavior change for consumers — filter-match highlighting renders identically. Motivated by the upstream package being unmaintained (last published 2024-09-03).

### Changed

- Removed `highlight-words` from runtime dependencies; the function is now bundled into `dist/index.{js,cjs}` and no longer appears in the rollup externals. Consumer install graphs shrink by one transitive dep.

## [0.1.4] — 2026-05-16

**Breaking CSS change (pre-1.0 refinement).** `dist/style.css` no longer ships a full Tailwind v4 utility build. It dropped from ~76 KB to ~5 KB and now contains only shadcn token defaults, library component CSS (scrollbar, focus ring), and nothing else — no Tailwind preflight, no `@theme`, no `.hidden` / `.flex` / etc.

Also reverts the pinned-cell `::before` overlay restored in 0.1.3 — the gray tint on pinned columns diverged from the v0.1.1 look and was reverted at user request. Pinned columns again render visually identical to scrolling columns (the warning fixes from 0.1.2 are unaffected; only the visual added in 0.1.3 is rolled back).

### Why

0.1.0–0.1.3 ran `@import 'tailwindcss'` through the library's own build, producing `dist/style.css` with the full Tailwind preflight + theme + every utility the library's source files happened to use (~3,465 lines). When a consumer also used Tailwind v4 — the common case for a shadcn-native library — every utility shipped by shadstack-table appeared twice in the resolved cascade. Because `shadstack-table/style.css` was almost always imported after the consumer's `globals.css`, the duplicate definitions won.

Symptom: `<div className="hidden md:block">` was permanently `display: none` at every viewport (the consumer's `.md\:block` and the library's `.hidden` had equal specificity, and the library's `.hidden` came later in source order). Reported against the shadcn `Sidebar` component — the desktop wrapper uses `hidden md:block` and was permanently invisible whenever shadstack-table was imported.

Every utility the library shipped was a latent cascade landmine.

### Required consumer migration

Your own Tailwind build now generates utilities for the library by scanning its source. In your `globals.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

/* path relative to globals.css */
@source '../node_modules/shadstack-table/dist';

@custom-variant dark (&:is(.dark *));

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

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
```

Keep `import 'shadstack-table/style.css'` at your app entry — it now ships only the library-specific bits (token _values_ plus library component CSS).

0.1.0–0.1.3 quietly shipped the `@theme inline` mapping and the `@layer base` reset inside the library's CSS bundle, which is part of what caused the cascade collision. Both now live in the consumer's globals — if you initialised with `shadcn init`, they're already there verbatim. Without `@theme inline`, Tailwind utilities like `bg-background` and `border-border` are unknown to the compiler and the table renders unstyled.

### Internal changes

- `packages/shadstack-table/src/_ui/styles.css` — dropped `@import 'tailwindcss'`, `@import 'tw-animate-css'`, `@source`, `@custom-variant`, `@theme inline`, and the `@layer base { * { @apply border-border outline-ring/50 } }` global reset. Kept token defaults, scrollbar styles, focus ring. Also dropped the 0.1.3 pinned-cell `::before` rules.
- `packages/shadstack-table/vite.config.ts` — dropped `@tailwindcss/vite` plugin; the library's own build no longer processes Tailwind directives.
- `packages/shadstack-table/src/utils/style.utils.ts` — removed the `getCellPinShadow` helper added in 0.1.3.
- `packages/shadstack-table/src/components/{head,body,footer}/*.tsx` — removed the `data-pin-shadow` attribute and the corresponding `getCellPinShadow` imports added in 0.1.3.
- `packages/shadstack-table/src/components/table/SST_TableContainer.tsx` — removed the `--sst-pinned-cell-overlay-bg` inline CSS variable added in 0.1.3; only `--sst-cell-outline-color` (focus ring, 0.1.2) remains.
- `apps/playground/src/globals.css` (new) — the monorepo playground now owns its Tailwind build, with `@source` pointed at the library source (it aliases `shadstack-table` to source). Imported from `main.tsx`.
- `apps/docs/src/styles/global.css` — added `@import 'tw-animate-css'`, `@theme inline` token mapping, and the `@layer base { * { @apply border-border outline-ring/50 } }` reset that used to be in the library bundle.
- README + getting-started docs updated with the new install incantation, the full shadcn baseline snippet, and an upgrade note from 0.1.3.

## [0.1.3] — 2026-05-16

Restores the pinned-cell `::before` overlay that 0.1.2 documented as a follow-up. Pinned columns now visually separate from the unpinned scrolling content with a tinted background and an inset edge shadow on the boundary cell — the original MRT behavior that was silently broken in 0.1.0–0.1.2 because the styles were emitted as nested selectors inside React inline `style={…}`.

### Added

- `[data-slot='sst-table-container'] :where(th, td)[data-pinned]::before` rule in `_ui/styles.css` paints the overlay background; `[data-pin-shadow='left'|'right']::before` adds the inset edge shadow on the last left-pinned / first right-pinned column.
- `SST_TableContainer` sets a new `--sst-pinned-cell-overlay-bg` custom property derived from `mrtTheme.baseBackgroundColor`. Consumers overriding the base background get a coherent overlay tint automatically.
- New `data-pin-shadow` attribute on head / body / footer cells (computed via the new `getCellPinShadow(column, isPinned)` helper exported from `utils/style.utils`).

### Notes

- `getCommonPinnedCellStyles` continues to return `{}` (deprecated since 0.1.2). The visual it described is now driven entirely by the stylesheet rule above. The export remains for API compatibility.
- Consumers who had styled around the absent overlay (e.g. by setting their own background on `[data-pinned]`) will see the overlay reappear. To suppress it, override `[data-pinned]::before { display: none; }` in your own stylesheet.

## [0.1.2] — 2026-05-16

Patch release that silences React DOM warnings emitted from every cell render. No behavior change for consumers — the focus ring and head-cell padding now resolve to the same values, just through a stylesheet rule and longhand sides respectively.

### Fixed

- Cell focus ring no longer leaks an `&:focus-visible` nested selector into React `style={…}`. The ring is now applied via a real CSS rule (`_ui/styles.css`) reading a new `--sst-cell-outline-color` custom property that `SST_TableContainer` sets from `mrtTheme.cellNavigationOutlineColor`. Theming via `mrtTheme.cellNavigationOutlineColor` continues to work.
- `SST_TableHeadCell` no longer emits the `padding` shorthand alongside `paddingTop` / `paddingBottom`. The horizontal padding is now expressed as `paddingLeft` / `paddingRight`, removing React's shorthand/longhand collision warning.
- `getCommonPinnedCellStyles` no longer returns nested `&[data-pinned="true"]` / `&:before` selectors that React silently dropped on every pinned cell. The export is preserved for API compatibility but now returns `{}`; reconstructing the pinned-cell overlay as a real CSS rule is tracked for 0.1.3.

[Unreleased]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.6...HEAD
[0.1.6]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.1...v0.1.2

## [0.1.1] — 2026-05-16

Metadata-only follow-up to 0.1.0. No code changes.

### Changed

- `homepage` field now points at the live docs site, <https://suleymanozkeskin.github.io/shadstack-table/>, instead of the GitHub README anchor. npm renders this as the package's "Homepage" link.
- Package README links to the docs site and live demo prominently at the top of the page.

## [0.1.0] — 2026-05-16

First public pre-release. The full `material-react-table` feature surface is ported to shadcn/ui primitives; the API shape is stable but may still receive breaking refinements before 1.0.

### Added

- Initial port of every MRT feature: sort, filter, paginate, row select, expand, column visibility, pinning, density toggle, column resize, virtualization (TanStack Virtual), cell editing (modal + inline).
- `ShadStackTable` / `useShadStackTable` public API, with the `SST_*` type prefix replacing `MRT_*`.
- shadcn primitives under `_ui/` (Radix UI wrappers) replacing the entire MUI surface.
- `Popover` + `Calendar` (`react-day-picker` v9) for the `date` and `date-range` filter variants via the new `SST_DateFilter` component.
- 39 locales carried over from MRT.
- First-party docs site (Astro + Starlight) at `apps/docs/`.

### Changed

- Built-in column ID prefix: `mrt-*` → `sst-*` (`sst-row-select`, `sst-row-actions`, etc.).
- `muiXxxProps` → `slotProps.xxx` one-to-one rename — every MUI-prefixed slot prop now goes through `slotProps`.

### Deferred (not in 0.1.0)

- `filterVariant: 'autocomplete'` — falls back to text input with a one-time `console.warn`.
- Column drag-reorder.
- `filterVariant: 'time' | 'datetime' | 'time-range' | 'datetime-range'` — native `<input>` is used until a shadcn time picker recipe lands.

[0.1.1]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/suleymanozkeskin/shadstack-table/releases/tag/v0.1.0
