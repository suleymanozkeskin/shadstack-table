# shadstack-table — architecture & contributor reference

This document is the long-lived companion to [GOAL.md](./GOAL.md) (product goals & non-goals). It describes the stack, the repo layout, and — most importantly — the MUI→shadcn substitution rules that encode design decisions a contributor needs when touching anything under `packages/shadstack-table/src/`.

> **Origin note.** This file began as the port plan for the initial fork from [`material-react-table`](https://github.com/KevinVandy/material-react-table). The port is complete; upstream is unmaintained and is no longer a workflow input. The file checklist, "open MRT source → mirror" workflow, and cross-session resume protocol that once lived here have been retired. The reference tables below remain the canonical record of why the component tree is shaped the way it is.

For consumer-facing documentation, see the docs site at `apps/docs/` (Starlight on Astro).

---

## Stack

| Layer           | Choice                                                       |
| --------------- | ------------------------------------------------------------ |
| Package manager | bun 1.3.2 (workspaces)                                       |
| Bundler         | Vite 7 (library mode in `packages/`, app in `apps/*`)        |
| Linter          | oxlint 1.63.0                                                |
| Formatter       | oxfmt 0.48.0                                                 |
| Language        | TypeScript 5.9 (strict, ES2022)                              |
| Table engine    | `@tanstack/react-table` v8                                   |
| Virtualization  | `@tanstack/react-virtual`                                    |
| UI primitives   | Radix UI (via shadcn-style wrappers in `src/_ui/`)           |
| Icons           | lucide-react                                                 |
| Styling         | Tailwind CSS v4 + `tw-animate-css`                           |
| Class merging   | `clsx` + `tailwind-merge` (via `cn()` in `src/lib/utils.ts`) |
| Other runtime   | `@tanstack/match-sorter-utils`, `highlight-words`            |
| Test runner     | Vitest 4 + `@testing-library/react` + happy-dom              |
| Docs            | Astro 6 + Starlight 0.38                                     |

`bun install` is constrained by `minimum-release-age: 864000s` (10 days). When pinning versions, find the newest release ≥10 days old via `curl https://registry.npmjs.org/<pkg>`.

---

## Repo layout

```
shadstack-table/
├── GOAL.md                        # product goal & architectural principles
├── PORT_PLAN.md                   # this file — architecture & contributor reference
├── README.md
├── LICENSE                        # MIT + upstream attribution
├── package.json                   # bun workspaces root
├── tsconfig.base.json
├── .oxlintrc.json
├── .oxfmtrc.json
├── packages/
│   └── shadstack-table/           # the library
│       ├── src/
│       │   ├── _ui/               # shadcn primitives (Radix wrappers, custom Spinner / Pagination)
│       │   ├── lib/utils.ts       # cn() helper
│       │   ├── components/        # SST_* components (body / buttons / footer / head / inputs / menus / modals / table / toolbar)
│       │   ├── fns/               # aggregation / filter / sorting fns
│       │   ├── hooks/             # useShadStackTable + internal hooks + display-column factories
│       │   ├── locales/           # 39 locales (en + 38 translations)
│       │   ├── utils/             # cell / column / row / style / virtualization helpers
│       │   ├── __tests__/         # Vitest smoke tests
│       │   ├── icons.ts           # SST_Default_Icons → lucide
│       │   ├── types.ts           # public type surface
│       │   └── index.ts           # barrel
│       └── vite.config.ts
├── apps/
│   ├── playground/                # Vite dev sandbox for trying the library
│   └── docs/                      # Astro + Starlight documentation site
└── material-react-table/          # gitignored local reference clone — not part of the workflow
```

---

## MUI → shadcn component mapping

This table is the canonical reference for any contributor working in `components/**/*.tsx`. Where shadcn lacks a direct equivalent, we either compose (`Stack` → flex div) or build a small custom primitive (custom `Pagination`, custom `Spinner`).

| MUI import                                                                                  | Replacement                                       | Notes                                  |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `Alert`, `AlertTitle`                                                                       | `src/_ui/alert.tsx`                               | severity → variant                     |
| `Badge`                                                                                     | `src/_ui/badge.tsx`                               | numeric badge needs custom render      |
| `Box`                                                                                       | `<div>`                                           | MUI `sx` → Tailwind classes via `cn()` |
| `Button`                                                                                    | `src/_ui/button.tsx`                              | `size="small"` → `size="sm"`           |
| `Checkbox`                                                                                  | `src/_ui/checkbox.tsx`                            | indeterminate via Radix data attr      |
| `Chip`                                                                                      | `src/_ui/badge.tsx` (variant)                     | chips are badges in shadcn             |
| `CircularProgress`                                                                          | `src/_ui/spinner.tsx`                             | lucide `Loader2` + spin                |
| `Collapse`                                                                                  | `src/_ui/collapsible.tsx`                         | Radix Collapsible                      |
| `Dialog`, `Dialog{Title,Content,Actions}`                                                   | `src/_ui/dialog.tsx`                              | shadcn Dialog\*                        |
| `Divider`                                                                                   | `src/_ui/separator.tsx`                           | orientation prop                       |
| `Fade`, `Grow`                                                                              | CSS transitions via tw-animate-css                | `data-state=open/closed` driven        |
| `FormControlLabel`                                                                          | `<Label>` + control composition                   |                                        |
| `FormHelperText`                                                                            | `<p class="text-sm text-muted-foreground">`       |                                        |
| `IconButton`                                                                                | `<Button variant="ghost" size="icon">`            |                                        |
| `InputAdornment`                                                                            | absolute-positioned span in input wrapper         |                                        |
| `InputLabel`                                                                                | `src/_ui/label.tsx`                               |                                        |
| `LinearProgress`                                                                            | `src/_ui/progress.tsx`                            | indeterminate variant via CSS          |
| `ListItemIcon`                                                                              | `<span class="mr-2">` inside menu item            |                                        |
| `Menu`, `MenuItem`                                                                          | `src/_ui/dropdown-menu.tsx`                       | shadcn DropdownMenu\*                  |
| `Pagination`, `PaginationItem`                                                              | custom in `_ui/pagination.tsx`                    |                                        |
| `Paper`                                                                                     | `<div class="rounded-md border bg-card ...">`     |                                        |
| `Popover`                                                                                   | `src/_ui/popover.tsx`                             |                                        |
| `Radio`, `RadioGroup`                                                                       | `src/_ui/radio-group.tsx`                         |                                        |
| `Select` (incl. native)                                                                     | `src/_ui/select.tsx`                              |                                        |
| `Skeleton`                                                                                  | `src/_ui/skeleton.tsx`                            |                                        |
| `Slider`                                                                                    | `src/_ui/slider.tsx`                              | range slider for filter                |
| `Stack`                                                                                     | `<div class="flex gap-... flex-col/row">`         | direction → flex-direction             |
| `Switch`                                                                                    | `src/_ui/switch.tsx`                              |                                        |
| `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableFooter`, `TableHead`, `TableRow` | `src/_ui/table.tsx`                               | shadcn Table parts                     |
| `TextField`                                                                                 | `<Input>` + `<Label>` composition                 | + optional adornment                   |
| `Tooltip`                                                                                   | `src/_ui/tooltip.tsx`                             |                                        |
| `useTheme`, `Theme`                                                                         | removed; classes are static or driven by CSS vars |                                        |

---

## MUI icon → lucide-react mapping

For `src/icons.ts`. Names on the right are lucide exports; the keys of `SST_Default_Icons` mirror the MUI icon naming convention (`ArrowDownwardIcon`, etc.) for familiarity to anyone migrating from a MUI-shaped table.

| Key                           | lucide           |
| ----------------------------- | ---------------- |
| `ArrowDownwardIcon`           | `ArrowDown`      |
| `ArrowRightIcon`              | `ArrowRight`     |
| `CancelIcon`                  | `XCircle`        |
| `ChevronLeftIcon`             | `ChevronLeft`    |
| `ChevronRightIcon`            | `ChevronRight`   |
| `ClearAllIcon`                | `ListX`          |
| `CloseIcon`                   | `X`              |
| `ContentCopy`                 | `Copy`           |
| `DensityLargeIcon`            | `Rows2`          |
| `DensityMediumIcon`           | `Rows3`          |
| `DensitySmallIcon`            | `Rows4`          |
| `DragHandleIcon`              | `GripHorizontal` |
| `DynamicFeedIcon`             | `Layers`         |
| `EditIcon`                    | `Pencil`         |
| `ExpandMoreIcon`              | `ChevronDown`    |
| `FilterAltIcon`               | `Filter`         |
| `FilterListIcon`              | `ListFilter`     |
| `FilterListOffIcon`           | `FilterX`        |
| `FirstPageIcon`               | `ChevronsLeft`   |
| `FullscreenIcon`              | `Maximize2`      |
| `FullscreenExitIcon`          | `Minimize2`      |
| `KeyboardDoubleArrowDownIcon` | `ChevronsDown`   |
| `LastPageIcon`                | `ChevronsRight`  |
| `MoreHorizIcon`               | `MoreHorizontal` |
| `MoreVertIcon`                | `MoreVertical`   |
| `PushPinIcon`                 | `Pin`            |
| `RestartAltIcon`              | `RotateCcw`      |
| `SaveIcon`                    | `Save`           |
| `SearchIcon`                  | `Search`         |
| `SearchOffIcon`               | `SearchX`        |
| `SortIcon`                    | `ArrowUpDown`    |
| `SyncAltIcon`                 | `ArrowLeftRight` |
| `ViewColumnIcon`              | `Columns3`       |
| `VisibilityOffIcon`           | `EyeOff`         |

---

## MUI features that don't map cleanly to shadcn

Tracked as we hit them. Each entry: the MUI surface that didn't translate, why, and how we're handling it. Goal: visibility for contributors who encounter these patterns in legacy code paths, not a blocker — every item has a chosen path forward.

| MUI surface                                                             | Issue                                                                               | Handling                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Theme` object, `useTheme`, `theme.palette.*`                           | Shadcn has no Theme primitive; theming lives in CSS variables on `:root` / `.dark`. | Remove `theme: Theme` params. Read tokens via `var(--<name>)`. Done in `style.utils.ts`.                                                                                                                   |
| `alpha()` / `darken()` / `lighten()`                                    | Runtime color math from `@mui/material/styles`.                                     | Replaced with CSS `color-mix(in oklch, …)` at the call site.                                                                                                                                               |
| `sx` prop                                                               | No equivalent — shadcn uses `className` + Tailwind.                                 | `slotProps.<name>` shapes drop `sx`. Consumers pass `className`.                                                                                                                                           |
| `Tooltip` placement variants (`top-start`, `bottom-end`, …)             | shadcn `<TooltipContent side>` only accepts `top \| right \| bottom \| left`.       | Map first segment (`'top-start'` → `side='top'`); drop the alignment suffix.                                                                                                                               |
| `Tooltip` `enterNextDelay`, `disableInteractive`                        | Not in Radix Tooltip.                                                               | Drop. We pass `delayDuration` only.                                                                                                                                                                        |
| `Pagination` (`boundaryCount`, `siblingCount`, `showFirstButton`, etc.) | shadcn `<Pagination>` is composable, not configurable.                              | Build a small page-window renderer in `SST_TablePagination.tsx` (`Pagination` parts + a `getPageRange()` helper).                                                                                          |
| `TextField` (built-in label + helperText + adornments + error)          | shadcn splits Input/Label and has no adornments slot.                               | Compose `<Label>` + relative wrapper around `<Input>` with absolute-positioned span for adornments. Helper text → `<p class="text-sm text-muted-foreground">`.                                             |
| `Select` `native: true`                                                 | shadcn Select is Radix-only; no native fallback.                                    | Always use Radix Select; document as a behavior change.                                                                                                                                                    |
| `Skeleton` variants (`text` / `circular` / `rectangular` / `rounded`)   | Single shadcn Skeleton.                                                             | Vary via `className`: `text` → `h-4 rounded`, `circular` → `rounded-full`, etc.                                                                                                                            |
| `CircularProgress` determinate mode                                     | Our `Spinner` is indeterminate-only.                                                | For "rows loading" indicators use `Progress` instead; determinate spinner stays out of v1.                                                                                                                 |
| `LinearProgress` indeterminate mode                                     | Our `Progress` is determinate-only.                                                 | Add an `indeterminate` prop in `SST_LinearProgressBar` that swaps in a CSS-keyframed stripe (lives in `_ui/styles.css`).                                                                                   |
| `Collapse` orientation `horizontal`                                     | Radix Collapsible animates `height` only.                                           | For horizontal collapse (e.g. side panels), do a `[data-state]`-driven width transition with Tailwind.                                                                                                     |
| `Fade`, `Grow` transition components                                    | No standalone equivalents.                                                          | Use `tw-animate-css` data-state utilities (`data-[state=open]:animate-in fade-in-…`).                                                                                                                      |
| `InputAdornment` (`start` / `end`)                                      | Not a shadcn primitive.                                                             | Wrap `<Input>` in `<div class="relative">` and absolute-position the icon span.                                                                                                                            |
| `Chip` (`onDelete`, `clickable`)                                        | Our `Badge` is a non-interactive span.                                              | For a deletable filter chip, compose inline: `<Badge>` + close `<Button variant="ghost" size="icon">`.                                                                                                     |
| `Badge` overlap / anchor positioning                                    | shadcn Badge is inline-only.                                                        | Manual wrapper: `<span class="relative">{icon}<Badge class="absolute -top-1 -right-1">…</Badge></span>`.                                                                                                   |
| `@mui/x-date-pickers` (Date/Time/DateTime)                              | No shadcn equivalent in v1.                                                         | Stub filter cells with `<input type="date" \| time \| datetime-local>`. Real picker is post-v1 (see GOAL.md non-goals).                                                                                    |
| `Autocomplete` (filter mode)                                            | Out of v1 scope per GOAL.md non-goals.                                              | Fall back to `<Input>` text filter for autocomplete columns. Log a runtime `console.warn` once when the column requests autocomplete.                                                                      |
| `Slider` `marks` prop                                                   | Radix Slider has no marks API.                                                      | For range filters that use marks, render them as absolute-positioned spans over the track.                                                                                                                 |
| `Switch` custom track/thumb styling                                     | shadcn Switch has fixed visuals; deep customization needs class overrides.          | Allow `slotProps.<switch>` className overrides; document the constraint.                                                                                                                                   |
| `Menu` `dense`, `autoFocusItem`                                         | Not direct DropdownMenu props.                                                      | `dense` → smaller class on `DropdownMenuItem`. `autoFocusItem` → use Radix Menu's `loop` + initial focus props.                                                                                            |
| `Popover` `anchorOrigin` / `transformOrigin`                            | Radix uses `side` + `align`.                                                        | Map `{ vertical, horizontal }` → closest `{ side, align }` pair at call sites.                                                                                                                             |
| `disableRipple`, `disableTouchRipple`                                   | No ripple in shadcn.                                                                | Drop; shadcn has no equivalent visual.                                                                                                                                                                     |
| `Stack` (`direction`, `spacing`, `divider`)                             | No shadcn primitive.                                                                | Replace with `<div class="flex flex-col/row gap-N">`. `divider` becomes interleaved `<Separator>`.                                                                                                         |
| `Box`                                                                   | Just a styled div.                                                                  | Replace with `<div>` + `className`.                                                                                                                                                                        |
| `FormControlLabel`                                                      | Couples label position to control.                                                  | Replace with explicit `<Label class="flex items-center gap-2">` wrapping the control.                                                                                                                      |
| `FormHelperText`                                                        | MUI form-control internals.                                                         | Replace with `<p class="text-sm text-muted-foreground">` (red variant via `text-destructive` on error).                                                                                                    |
| `theme.direction === 'rtl'` (RTL flips)                                 | No Theme; we read direction from `document.dir`.                                    | Helper `flipIconStyles(direction)` takes the string; component sites pass `useDirection()` (small hook reading `document.documentElement.dir`).                                                            |
| `Menu` w/ `anchorEl` (imperative DOM positioning)                       | Radix DropdownMenu requires a `<Trigger>`; no equivalent of MUI's free-form anchor. | Use `<Popover open={!!anchorEl}>` + `<PopoverAnchor virtualRef={{ current: anchorEl }} />` from Radix Popper, with menu-styled items inside `<PopoverContent>`. Applied across all `SST_*Menu` components. |
| `useMediaQuery` from `@mui/material`                                    | No equivalent.                                                                      | Tiny inline `useMediaQuery(query)` hook backed by `window.matchMedia`. Inlined per call site (toolbar files).                                                                                              |
| `useTheme().zIndex.modal`                                               | No theme tokens for z-index.                                                        | Hard-code `zIndex: 50` (matches shadcn Dialog/Tooltip/Popover stack).                                                                                                                                      |
| `MUI Box component="span" sx={{ flex: '0 0' }}` etc.                    | n/a                                                                                 | All `Box` swapped to `<div>` (or `<span>` when inline) + Tailwind classes.                                                                                                                                 |
| `Skeleton variant="text" animation="wave"`                              | shadcn `<Skeleton>` is one element with no animation prop.                          | Drop variants; rely on `tw-animate-css` `animate-pulse` baked into shadcn skeleton.                                                                                                                        |

---

## slotProps additions tracked over time

`muiXxxProps` → `slotProps.xxx` was a one-pass rename in the initial port. Fields that surfaced later land here; the `types.ts` implementation is authoritative.

| Original MUI field       | Our slotProps path          | Type source                     |
| ------------------------ | --------------------------- | ------------------------------- |
| `muiCreateRowModalProps` | `slotProps.createRowDialog` | `ComponentProps<typeof Dialog>` |

---

## Decision log

- 2026-05-16 — **Test suite scaffolded.** Vitest + `@testing-library/react` + happy-dom; tests live in `packages/shadstack-table/src/__tests__/`. 10 smoke tests cover the v1 priority feature surface. Wired into the `check` CI job; coverage workflow exists but is `workflow_dispatch`-only until the suite stabilizes. Pinning/resize/virtualization deferred to a Playwright pass (viewport-dependent behavior that happy-dom does not simulate).
- 2026-05-16 — **Renamed away from upstream MRT naming.** `MRT_*` prefix → `SST_*`; `MaterialReactTable` → `ShadStackTable`; `useMaterialReactTable` → `useShadStackTable`. Locale message keys followed (e.g. `MRT_AggregationFn_count` → `SST_AggregationFn_count`). Built-in column IDs (`mrt-row-*`) followed (`mrt-row-select` → `sst-row-select`, etc.) along with matching `data-slot` attribute values and CSS selectors.
- 2026-05-16 — **First-party docs site.** Starlight on Astro at `apps/docs/`, examples wired via source alias so docs and the library never drift. Replaces reliance on the unmaintained upstream docs site (`material-react-table.com`).
- 2026-05-16 — **Retired the literal-port workflow.** The "open MRT source → mirror" porting flow is no longer the development model. Upstream is unmaintained; the fork is independent. The MUI→shadcn mapping tables above remain as a contributor reference, not as an active porting tool.
- **Ship pre-compiled CSS** (`dist/style.css`) so consumers don't need a Tailwind setup. Consumers `import 'shadstack-table/style.css'` once.
- **Radix primitives stay external** (peer or runtime deps), but our wrappers live in `src/_ui/` and are bundled. This keeps the public API a single `shadstack-table` import.
- **Tailwind v4 + tw-animate-css** (not v3 + tailwindcss-animate). The shadcn registry expects v4 conventions.
