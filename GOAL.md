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

## Future work (post-v1, required for continuous-success of the port)

These are not optional. They are gating items for shipping any v1.x and beyond. Add to CI as gates as each lands.

1. **Comprehensive test suite.** Upstream MRT has zero unit/integration tests — only 54 Storybook stories as de-facto specs. We need our own. Targets:
   - [x] Vitest + `@testing-library/react` scaffolded with happy-dom; smoke tests cover sort, paginate, row-select, column-filter, global-filter, column-visibility, density, editing (modal), expanding. Wired into the `check` CI job.
   - [ ] Unit + integration coverage of the remaining v1 features (column pinning, column resize, virtualization).
   - [ ] Playwright (or equivalent) for cross-browser smoke + keyboard accessibility. Pinning/resize and other viewport-dependent behavior that happy-dom can't simulate go here.
   - [ ] Each MRT Storybook story → at least one equivalent test asserting the same observable behavior; the stories are our behavioral oracle until tests exist.
   - [ ] Visual regression (Chromatic / Playwright snapshots) for the rendered table at a small set of canonical states.

2. **react-doctor in CI.** Run the [react-doctor](https://www.npmjs.com/package/react-doctor) skill / equivalent linting on every PR. Catches common React 19 anti-patterns (stale closures, derived state, key misuse, missed memoization in virtualized lists).

3. **oxlint + oxfmt enforced.** Configs exist (`.oxlintrc.json`, `.oxfmtrc.json`); make them gating:
   - Pre-commit hook (lint-staged + husky, or a bun-native equivalent) that runs `oxlint` and `oxfmt --check` on staged files.
   - CI workflow: `bun run lint && bun run format:check && bun run typecheck && bun run build` blocks merge.
   - Zero warnings, zero errors policy on PR merge.

## When the repo goes public

Branch protection rulesets aren't a free feature on private repos. The hardening PR (#10) exported them to `.github/rulesets/*.json` but they don't auto-apply. When the repo is flipped to public:

1. Settings → Rules → Rulesets → Import → upload each JSON in `.github/rulesets/`. At minimum: require PR + 1 review + CI green on `main`, block force-pushes, block deletion.
2. Settings → Actions → General → Workflow permissions: confirm "Read repository contents permission" (matches the per-job `permissions:` blocks in our workflows).
3. Trusted Publishing for npm: set up the OIDC trust relationship on npmjs.com, then flip `release.yml`'s `if: false` gate to `if: github.event.inputs.publish == 'true'`.

## Decision log

- 2026-05-16 — v1 scoped to shadcn only; Kumo and MUI adapters deferred.
- 2026-05-16 — rejected runtime `uiLibChoice` config (bundle size); adapter boundary stays as an internal contract.
- 2026-05-16 — comprehensive test suite + react-doctor + enforced oxlint/oxfmt added as post-v1 gating items (no MRT tests to inherit; quality bar is ours to set).
- 2026-05-16 — Vitest + RTL + happy-dom scaffolded with 10 smoke tests covering the v1 priority surface (sort/paginate/select/filter/global-filter/column-visibility/density/edit/expand). Coverage workflow wired but kept on `workflow_dispatch` until the suite stabilizes.
