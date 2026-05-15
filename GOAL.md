# Goal

Build a shadcn-native React data table that delivers the same feature surface as `material-react-table` (MRT), with no MUI dependency.

## v1 scope

- Single UI adapter: shadcn/ui
- TanStack Table v8 as the underlying engine
- Single npm package, single import path
- Feature parity targets (priority order):
  - Sort, filter, paginate, row select, expand
  - Column visibility, pinning, density toggle, column resize
  - Virtualization (TanStack Virtual)
  - Cell editing modes — TBD per scope review

## Non-goals (v1)

- Kumo, MUI, or any non-shadcn adapter
- Drop-in API compatibility with MRT's `muiXxxProps`
- Internationalization beyond English
- Column drag-reorder; range slider / autocomplete / date-time filters

## Architectural principles

1. **No UI-lib imports in `core/`.** The rendering layer talks only to a typed primitives interface. shadcn lives behind that interface.
2. **One adapter today, contract for many.** Adding Kumo or MUI later is a new file, not a refactor.
3. **Normalized props at the boundary.** Primitives expose library-agnostic shapes (`variant: 'default' | 'outline' | 'ghost'`). Library-specific overrides go through a `componentProps` passthrough.
4. **Consumer API is shadcn-shaped, not MRT-shaped.** `slotProps` replaces `muiXxxProps`. Migration from MRT is a config rewrite, not drop-in.
5. **Core ships zero CSS.** Adapters own styling.

## Decision log

- 2026-05-16 — v1 scoped to shadcn only; Kumo and MUI adapters deferred.
- 2026-05-16 — rejected runtime `uiLibChoice` config (bundle size); adapter boundary stays as an internal contract.
