# Changelog

All notable changes to `shadstack-table` are recorded here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.3...HEAD
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
