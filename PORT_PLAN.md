# shadstack-table — port plan

This document is the source of truth for the literal port of `material-react-table` (MRT) → `shadstack-table`. It is designed to be resumable: any session can read this and know exactly what's done, what's next, and what conventions to follow.

Pair this with [GOAL.md](./GOAL.md) (product goal & architectural principles) and the cloned upstream at `material-react-table/` (gitignored reference; do not edit).

---

## Strategy: literal port

- **File-for-file mirror.** Every file under `material-react-table/packages/material-react-table/src/**` has a corresponding file at `packages/shadstack-table/src/**` with the same path and same filename.
- **Identical exports.** `MRT_*` prefix is preserved. `MaterialReactTable` is exported under that exact name. Consumers migrate by changing only the import path: `from 'material-react-table'` → `from 'shadstack-table'`.
- **Only MUI is replaced.** MUI components → shadcn (Radix + Tailwind). MUI icons → lucide-react. MUI `sx` props / `Theme` → Tailwind class strings via `cn()`. Everything else (logic, hooks, TanStack Table usage, filter fns, locales) is copied verbatim.
- **No drop-in `muiXxxProps` compat.** Per GOAL.md, consumer-facing prop names become `slotProps`/shadcn-shaped. The internal component tree mirrors MRT exactly so we can diff upstream PRs.

---

## Stack

| Layer           | Choice                                                            |
| --------------- | ----------------------------------------------------------------- |
| Package manager | bun 1.3.2 (workspaces)                                            |
| Bundler         | Vite 7 (library mode in `packages/`, app in `apps/playground`)    |
| Linter          | oxlint 1.63.0                                                     |
| Formatter       | oxfmt 0.48.0                                                      |
| Language        | TypeScript 5.9 (strict, ES2022)                                   |
| Table engine    | `@tanstack/react-table` v8 (unchanged from MRT)                   |
| Virtualization  | `@tanstack/react-virtual` (unchanged from MRT)                    |
| UI primitives   | Radix UI (via shadcn-style wrappers in `src/_ui/`)                |
| Icons           | lucide-react                                                      |
| Styling         | Tailwind CSS v4 + `tw-animate-css`                                |
| Class merging   | `clsx` + `tailwind-merge` (via `cn()` in `src/lib/utils.ts`)      |
| Other runtime   | `@tanstack/match-sorter-utils`, `highlight-words` (both from MRT) |

`bun install` is constrained by `minimum-release-age: 864000s` (10 days). When pinning versions, find the newest release ≥10 days old via `curl https://registry.npmjs.org/<pkg>`.

---

## Repo layout

```
shadstack-table/
├── GOAL.md                        # product goal & architectural principles
├── PORT_PLAN.md                   # this file
├── package.json                   # bun workspaces root
├── tsconfig.base.json
├── .oxlintrc.json
├── .oxfmtrc.json
├── packages/
│   └── shadstack-table/           # the library (mirrors MRT's packages/material-react-table)
│       ├── src/
│       │   ├── _ui/               # shadcn primitives (NEW — replaces MUI surface)
│       │   ├── lib/utils.ts       # cn() helper
│       │   ├── components/        # MIRRORS MRT (same paths, same filenames)
│       │   ├── fns/
│       │   ├── hooks/
│       │   ├── locales/
│       │   ├── utils/
│       │   ├── icons.ts
│       │   ├── types.ts
│       │   └── index.ts
│       └── vite.config.ts
├── apps/
│   └── playground/                # Vite dev sandbox for trying the library
└── material-react-table/          # cloned upstream (gitignored) — reference only
```

---

## MUI → shadcn component mapping

Used by every `components/**/*.tsx` port. Where shadcn lacks a direct equivalent, we either compose (`Stack` → flex div) or build a small custom (`Pagination`, spinner).

| MUI import                                                                                  | Replacement                                       | Notes                                  |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `Alert`, `AlertTitle`                                                                       | `src/_ui/alert.tsx` (shadcn)                      | severity → variant                     |
| `Badge`                                                                                     | `src/_ui/badge.tsx`                               | numeric badge needs custom render      |
| `Box`                                                                                       | `<div>`                                           | MUI `sx` → Tailwind classes via `cn()` |
| `Button`                                                                                    | `src/_ui/button.tsx`                              | `size="small"` → `size="sm"`           |
| `Checkbox`                                                                                  | `src/_ui/checkbox.tsx`                            | indeterminate via Radix data attr      |
| `Chip`                                                                                      | `src/_ui/badge.tsx` (variant)                     | chips are badges in shadcn             |
| `CircularProgress`                                                                          | custom spinner in `_ui/spinner.tsx`               | lucide `Loader2` + spin                |
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

For `src/icons.ts`. Names on the right are lucide exports; the keys of `MRT_Default_Icons` keep MRT's naming (`ArrowDownwardIcon`, etc.) so downstream code is unchanged.

| MRT key                       | lucide           |
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

## File checklist (87 source files + 39 locales)

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

### Infrastructure

- [x] Bun workspace, Vite, oxlint, oxfmt, tsconfig
- [x] `src/lib/utils.ts` — `cn()` helper
- [x] `src/_ui/styles.css` — Tailwind v4 + theme vars + tw-animate-css
- [x] Vite library build emits `dist/style.css` (9.4 kB / 2.3 kB gz) + `./style.css` export

### `src/_ui/` (shadcn primitives — new)

- [x] `alert.tsx`
- [x] `badge.tsx`
- [x] `button.tsx`
- [x] `checkbox.tsx`
- [x] `collapsible.tsx`
- [x] `dialog.tsx`
- [x] `dropdown-menu.tsx`
- [x] `input.tsx`
- [x] `label.tsx`
- [x] `pagination.tsx` (custom — composes `button.tsx`)
- [x] `popover.tsx`
- [x] `progress.tsx`
- [x] `radio-group.tsx`
- [x] `select.tsx`
- [x] `separator.tsx`
- [x] `skeleton.tsx`
- [x] `slider.tsx`
- [x] `spinner.tsx` (custom — `Loader2` + spin)
- [x] `switch.tsx`
- [x] `table.tsx`
- [x] `tooltip.tsx`

### `src/locales/` (39 files — mechanical copy, no MUI)

- [x] All 39 locale files: `ar, az, bg, cs, da, de, el, en, es, et, fa, fi, fr, he, hr, hu, hy, id, it, ja, ko, mk, nl, no, np, pl, pt-BR, pt, ro, ru, sk, sr-Cyrl-RS, sr-Latn-RS, sv, tr, uk, vi, zh-Hans, zh-Hant`

### `src/fns/` (3 files — mostly pure)

- [x] `aggregationFns.ts`
- [x] `filterFns.ts`
- [x] `sortingFns.ts`

### `src/utils/` (8 files)

- [x] `cell.utils.ts`
- [x] `column.utils.ts`
- [x] `displayColumn.utils.ts`
- [x] `row.utils.ts`
- [x] `style.utils.ts` ← heaviest MUI swap (Theme → CSS vars, sx → tw classes)
- [x] `tanstack.helpers.ts`
- [x] `utils.ts`
- [x] `virtualization.utils.ts`

### `src/hooks/` (8 files + 7 display-column hooks)

- [x] `useMaterialReactTable.ts`
- [x] `useMRT_ColumnVirtualizer.ts`
- [x] `useMRT_Effects.ts`
- [x] `useMRT_RowVirtualizer.ts`
- [x] `useMRT_Rows.ts`
- [x] `useMRT_TableInstance.ts`
- [x] `useMRT_TableOptions.ts`
- [x] `display-columns/getMRT_RowActionsColumnDef.tsx`
- [x] `display-columns/getMRT_RowDragColumnDef.tsx`
- [x] `display-columns/getMRT_RowExpandColumnDef.tsx`
- [x] `display-columns/getMRT_RowNumbersColumnDef.tsx`
- [x] `display-columns/getMRT_RowPinningColumnDef.tsx`
- [x] `display-columns/getMRT_RowSelectColumnDef.tsx`
- [x] `display-columns/getMRT_RowSpacerColumnDef.tsx`

### `src/components/` (59 files — heaviest MUI swap)

- [x] `MaterialReactTable.tsx`
- **body/** (7)
  - [x] `MRT_TableBody.tsx`
  - [x] `MRT_TableBodyCell.tsx`
  - [x] `MRT_TableBodyCellValue.tsx`
  - [x] `MRT_TableBodyRow.tsx`
  - [x] `MRT_TableBodyRowGrabHandle.tsx`
  - [x] `MRT_TableBodyRowPinButton.tsx`
  - [x] `MRT_TableDetailPanel.tsx`
- **buttons/** (13)
  - [x] `MRT_ColumnPinningButtons.tsx`
  - [x] `MRT_CopyButton.tsx`
  - [x] `MRT_EditActionButtons.tsx`
  - [x] `MRT_ExpandAllButton.tsx`
  - [x] `MRT_ExpandButton.tsx`
  - [x] `MRT_GrabHandleButton.tsx`
  - [x] `MRT_RowPinButton.tsx`
  - [x] `MRT_ShowHideColumnsButton.tsx`
  - [x] `MRT_ToggleDensePaddingButton.tsx`
  - [x] `MRT_ToggleFiltersButton.tsx`
  - [x] `MRT_ToggleFullScreenButton.tsx`
  - [x] `MRT_ToggleGlobalFilterButton.tsx`
  - [x] `MRT_ToggleRowActionMenuButton.tsx`
- **footer/** (3)
  - [x] `MRT_TableFooter.tsx`
  - [x] `MRT_TableFooterCell.tsx`
  - [x] `MRT_TableFooterRow.tsx`
- **head/** (9)
  - [x] `MRT_TableHead.tsx`
  - [x] `MRT_TableHeadCell.tsx`
  - [x] `MRT_TableHeadCellColumnActionsButton.tsx`
  - [x] `MRT_TableHeadCellFilterContainer.tsx`
  - [x] `MRT_TableHeadCellFilterLabel.tsx`
  - [x] `MRT_TableHeadCellGrabHandle.tsx`
  - [x] `MRT_TableHeadCellResizeHandle.tsx`
  - [x] `MRT_TableHeadCellSortLabel.tsx`
  - [x] `MRT_TableHeadRow.tsx`
- **inputs/** (7)
  - [x] `MRT_EditCellTextField.tsx`
  - [x] `MRT_FilterCheckbox.tsx`
  - [x] `MRT_FilterRangeFields.tsx`
  - [x] `MRT_FilterRangeSlider.tsx`
  - [x] `MRT_FilterTextField.tsx`
  - [x] `MRT_GlobalFilterTextField.tsx`
  - [x] `MRT_SelectCheckbox.tsx`
- **menus/** (7)
  - [x] `MRT_ActionMenuItem.tsx`
  - [x] `MRT_CellActionMenu.tsx`
  - [x] `MRT_ColumnActionMenu.tsx`
  - [x] `MRT_FilterOptionMenu.tsx`
  - [x] `MRT_RowActionMenu.tsx`
  - [x] `MRT_ShowHideColumnsMenu.tsx`
  - [x] `MRT_ShowHideColumnsMenuItems.tsx`
- **modals/** (1)
  - [x] `MRT_EditRowModal.tsx`
- **table/** (4)
  - [x] `MRT_Table.tsx`
  - [x] `MRT_TableContainer.tsx`
  - [x] `MRT_TableLoadingOverlay.tsx`
  - [x] `MRT_TablePaper.tsx`
- **toolbar/** (7)
  - [x] `MRT_BottomToolbar.tsx`
  - [x] `MRT_LinearProgressBar.tsx`
  - [x] `MRT_TablePagination.tsx`
  - [x] `MRT_ToolbarAlertBanner.tsx`
  - [x] `MRT_ToolbarDropZone.tsx`
  - [x] `MRT_ToolbarInternalButtons.tsx`
  - [x] `MRT_TopToolbar.tsx`

### Top-level

- [x] `src/icons.ts` (MUI icons → lucide)
- [x] `src/types.ts` (1289 LOC — most types are MUI-agnostic; the few `Mui*Props` references become `slotProps` accepting our shadcn equivalents)
- [x] `src/index.ts` (mirror MRT's barrel exports) — only `export * from './types'` added; rest left for future batch

---

## Workflow per file

1. Open the MRT source: `material-react-table/packages/material-react-table/src/<path>`.
2. Create the mirror at `packages/shadstack-table/src/<path>`.
3. Swap MUI imports per the mapping table above. Swap MUI icons per the icon table.
4. Convert any `sx={{...}}` props to Tailwind classes via `cn(...)`. Static MUI theme tokens (`theme.palette.primary.main`) → CSS vars exposed in `_ui/styles.css`.
5. Keep logic verbatim. Do not refactor.
6. Tick the box in the checklist above.
7. After each batch (e.g. all of `fns/`), run `bun run typecheck` + `bun run lint`.

---

## Decisions

- **Component & file names unchanged from MRT** (`MRT_TableBody`, `MaterialReactTable`, etc.). Rationale: cheapest migration path for MRT users; easiest upstream-diff for ongoing parity. Rename in a future pass if desired.
- **Ship pre-compiled CSS** (`dist/style.css`) so consumers don't need a Tailwind setup. Consumers `import 'shadstack-table/style.css'` once.
- **Radix primitives stay external** (peer or runtime deps), but our wrappers live in `src/_ui/` and are bundled. This keeps the public API a single `shadstack-table` import.
- **Tailwind v4 + tw-animate-css** (not v3 + tailwindcss-animate). Newer registry of shadcn primitives expects v4 conventions.
- **No `EnterPlanMode` flow per port file.** The plan is this document. We just execute file-by-file.

---

## Open questions (resolve as they come up)

- **Drag-and-drop reorder.** MRT uses HTML5 DnD natively. Keep as-is or swap to `@dnd-kit/*`? — _Default: keep HTML5 DnD verbatim for the literal port._
- **Date picker.** MRT depends on `@mui/x-date-pickers`. Date filter cells need a shadcn alternative (e.g. shadcn calendar via Radix). — _Default: stub with `<Input type="date">` for v1._
- **`Mui*Props` passthroughs in `types.ts`.** Rename to `slotProps.<element>` taking our shadcn equivalent's props.

---

## Cross-session resume protocol

When starting a new session:

1. Read this file and `GOAL.md`.
2. Run `bun install` (only if dependencies changed).
3. Check the file checklist above for the next pending item.
4. `cd material-react-table/packages/material-react-table` to consult the source whenever needed.
5. Run `bun run typecheck && bun run lint && bun run build` after each batch.
6. Tick boxes in this file as you complete files. Commit `PORT_PLAN.md` updates with the changes.

---

## MUI features that don't map cleanly to shadcn

Tracked as we hit them. Each entry: the MUI surface, why it doesn't translate, and how we're handling it. Goal: visibility, not a blocker — every item below has a chosen path forward.

| MUI surface                                                             | Issue                                                                               | Handling                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Theme` object, `useTheme`, `theme.palette.*`                           | Shadcn has no Theme primitive; theming lives in CSS variables on `:root` / `.dark`. | Remove `theme: Theme` params. Read tokens via `var(--<name>)`. Done in `style.utils.ts`.                                                                                                                   |
| `alpha()` / `darken()` / `lighten()`                                    | Runtime color math from `@mui/material/styles`.                                     | Replaced with CSS `color-mix(in oklch, …)` at the call site.                                                                                                                                               |
| `sx` prop                                                               | No equivalent — shadcn uses `className` + Tailwind.                                 | `slotProps.<name>` shapes drop `sx`. Consumers pass `className`.                                                                                                                                           |
| `Tooltip` placement variants (`top-start`, `bottom-end`, …)             | shadcn `<TooltipContent side>` only accepts `top \| right \| bottom \| left`.       | Map first segment (`'top-start'` → `side='top'`); drop the alignment suffix.                                                                                                                               |
| `Tooltip` `enterNextDelay`, `disableInteractive`                        | Not in Radix Tooltip.                                                               | Drop. We pass `delayDuration` only.                                                                                                                                                                        |
| `Pagination` (`boundaryCount`, `siblingCount`, `showFirstButton`, etc.) | shadcn `<Pagination>` is composable, not configurable.                              | Build a small page-window renderer in `MRT_TablePagination.tsx` (`Pagination` parts + a `getPageRange()` helper).                                                                                          |
| `TextField` (built-in label + helperText + adornments + error)          | shadcn splits Input/Label and has no adornments slot.                               | Compose `<Label>` + relative wrapper around `<Input>` with absolute-positioned span for adornments. Helper text → `<p class="text-sm text-muted-foreground">`.                                             |
| `Select` `native: true`                                                 | shadcn Select is Radix-only; no native fallback.                                    | Always use Radix Select; document as a behavior change.                                                                                                                                                    |
| `Skeleton` variants (`text` / `circular` / `rectangular` / `rounded`)   | Single shadcn Skeleton.                                                             | Vary via `className`: `text` → `h-4 rounded`, `circular` → `rounded-full`, etc.                                                                                                                            |
| `CircularProgress` determinate mode                                     | Our `Spinner` is indeterminate-only.                                                | For "rows loading" indicators use `Progress` instead; determinate spinner stays out of v1.                                                                                                                 |
| `LinearProgress` indeterminate mode                                     | Our `Progress` is determinate-only.                                                 | Add an `indeterminate` prop in `MRT_LinearProgressBar` that swaps in a CSS-keyframed stripe (lives in `_ui/styles.css`).                                                                                   |
| `Collapse` orientation `horizontal`                                     | Radix Collapsible animates `height` only.                                           | If MRT uses horizontal collapse anywhere (e.g. side panels), do a `[data-state]`-driven width transition with Tailwind.                                                                                    |
| `Fade`, `Grow` transition components                                    | No standalone equivalents.                                                          | Use `tw-animate-css` data-state utilities (`data-[state=open]:animate-in fade-in-…`).                                                                                                                      |
| `InputAdornment` (`start` / `end`)                                      | Not a shadcn primitive.                                                             | Wrap `<Input>` in `<div class="relative">` and absolute-position the icon span.                                                                                                                            |
| `Chip` (`onDelete`, `clickable`)                                        | Our `Badge` is a non-interactive span.                                              | When MRT renders a deletable filter chip, build a tiny `Chip` inline (Badge + close `<Button variant="ghost" size="icon">`).                                                                               |
| `Badge` overlap / anchor positioning                                    | shadcn Badge is inline-only.                                                        | Manual wrapper: `<span class="relative">{icon}<Badge class="absolute -top-1 -right-1">…</Badge></span>`.                                                                                                   |
| `@mui/x-date-pickers` (Date/Time/DateTime)                              | No shadcn equivalent in v1.                                                         | Stub filter cells with `<input type="date" \| time \| datetime-local>`. Real picker is post-v1 (see GOAL.md non-goals).                                                                                    |
| `Autocomplete` (filter mode)                                            | Out of v1 scope per GOAL.md non-goals.                                              | Fall back to `<Input>` text filter for autocomplete columns. Log a runtime `console.warn` once when the column requests autocomplete.                                                                      |
| `Slider` `marks` prop                                                   | Radix Slider has no marks API.                                                      | If MRT range filter uses marks, render them as absolute-positioned spans over the track.                                                                                                                   |
| `Switch` custom track/thumb styling                                     | shadcn Switch has fixed visuals; deep customization needs class overrides.          | Allow `slotProps.<switch>` className overrides; document the constraint.                                                                                                                                   |
| `Menu` `dense`, `autoFocusItem`                                         | Not direct DropdownMenu props.                                                      | `dense` → smaller class on `DropdownMenuItem`. `autoFocusItem` → use Radix Menu's `loop` + initial focus props.                                                                                            |
| `Popover` `anchorOrigin` / `transformOrigin`                            | Radix uses `side` + `align`.                                                        | Map `{ vertical, horizontal }` → closest `{ side, align }` pair at call sites.                                                                                                                             |
| `disableRipple`, `disableTouchRipple`                                   | No ripple in shadcn.                                                                | Drop; shadcn has no equivalent visual.                                                                                                                                                                     |
| `Stack` (`direction`, `spacing`, `divider`)                             | No shadcn primitive.                                                                | Replace with `<div class="flex flex-col/row gap-N">`. `divider` becomes interleaved `<Separator>`.                                                                                                         |
| `Box`                                                                   | Just a styled div.                                                                  | Replace with `<div>` + `className`.                                                                                                                                                                        |
| `FormControlLabel`                                                      | Couples label position to control.                                                  | Replace with explicit `<Label class="flex items-center gap-2">` wrapping the control.                                                                                                                      |
| `FormHelperText`                                                        | MUI form-control internals.                                                         | Replace with `<p class="text-sm text-muted-foreground">` (red variant via `text-destructive` on error).                                                                                                    |
| `theme.direction === 'rtl'` (RTL flips)                                 | No Theme; we read direction from `document.dir`.                                    | Helper `flipIconStyles(direction)` takes the string; component sites pass `useDirection()` (small hook reading `document.documentElement.dir`).                                                            |
| `Menu` w/ `anchorEl` (imperative DOM positioning)                       | Radix DropdownMenu requires a `<Trigger>`; no equivalent of MUI's free-form anchor. | Use `<Popover open={!!anchorEl}>` + `<PopoverAnchor virtualRef={{ current: anchorEl }} />` from Radix Popper, with menu-styled items inside `<PopoverContent>`. Applied across all `MRT_*Menu` components. |
| `useMediaQuery` from `@mui/material`                                    | No equivalent.                                                                      | Tiny inline `useMediaQuery(query)` hook backed by `window.matchMedia`. Inlined per call site (toolbar files).                                                                                              |
| `useTheme().zIndex.modal`                                               | No theme tokens for z-index.                                                        | Hard-code `zIndex: 50` (matches shadcn Dialog/Tooltip/Popover stack).                                                                                                                                      |
| `MUI Box component="span" sx={{ flex: '0 0' }}` etc.                    | n/a                                                                                 | All `Box` swapped to `<div>` (or `<span>` when inline) + Tailwind classes.                                                                                                                                 |
| `Skeleton variant="text" animation="wave"`                              | shadcn `<Skeleton>` is one element with no animation prop.                          | Drop variants; rely on `tw-animate-css` `animate-pulse` baked into shadcn skeleton.                                                                                                                        |

---

## slotProps rename additions (found during port)

The initial rename pass (in the prompt that produced types.ts) missed fields that surfaced once the port actually touched the upstream source. New entries land here; the `types.ts` implementation is authoritative.

| MRT field (upstream)     | Our slotProps path          | Type source                     |
| ------------------------ | --------------------------- | ------------------------------- |
| `muiCreateRowModalProps` | `slotProps.createRowDialog` | `ComponentProps<typeof Dialog>` |
