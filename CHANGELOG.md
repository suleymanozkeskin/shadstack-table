# Changelog

All notable changes to `shadstack-table` are recorded here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/suleymanozkeskin/shadstack-table/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/suleymanozkeskin/shadstack-table/releases/tag/v0.1.0
