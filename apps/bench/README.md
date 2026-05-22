# `shadstack-table` render benchmarks

Render-time benchmarks for `ShadStackTable` at 1k / 10k / 50k rows, plus a
deterministic cell-render-count probe for catching render amplification.
Used to spot order-of-magnitude regressions during local review — **not**
wired up as a CI gate, since the wall-clock numbers are noisy across
machines.

## What's measured

### Wall-clock benches (`bun run bench`)

Two flavours of scenario at each dataset size:

**Full-rerender scenarios** — every visible cell is expected to re-render:

1. **Initial mount, no virtualization** — bare `<ShadStackTable>` with N
   rows, all rows rendered.
2. **Initial mount, virtualized** — same dataset with
   `enableRowVirtualization: true`. The realistic shape for 10k+ rows.
3. **Mount + `setSorting(...)` after mount** — initial render plus a
   controlled `useEffect` that calls `table.setSorting(...)` once.
   Measured with and without virtualization.

**Narrow-state-change scenarios** (virtualized only) — only a small slice
of UI conceptually needs to update, so the gap between these and a full
rerender is the render-amplification signal:

4. **Mount + `setHoveredRow`** — should only re-render the hovered row.
5. **Mount + `setEditingCell`** — should only re-render the edited cell.
6. **Mount + `setDraggingColumn`** — should not re-render body cells.
7. **Mount + `setColumnFilters`** — exercises the `highlightWords` text
   path on visible rows.

The 50k unvirtualized cases are skipped on purpose: rendering 50k rows × 4
columns of full table cells under happy-dom takes multiple seconds per
sample and provides no actionable signal — anyone shipping unvirtualized
50k rows already has bigger problems. Narrow-state-change scenarios are
skipped at 50k for the same reason — at that size mount cost dominates the
post-mount setter and obscures the signal.

Total: **16 benchmark cases** (3 full-rerender × 3 sizes − 2 skipped 50k
unvirtualized = 7, plus 4 narrow-state × 2 sizes = 8, plus 1 virtualized
50k for sort = 16; actual counts are visible in the runner output).

### Cell-render counts (`bun run --filter=bench test`)

`src/commit-counts.test.tsx` is the deterministic counterpart to scenarios
4–7. It mounts an unvirtualized 100-row table with instrumented `Cell`
renderers that increment a counter on every invocation, then drives one
narrow state change under `act` and snapshots the resulting counts. Wall
clock varies across machines; cell-render counts in happy-dom do not.

Today's snapshots show every narrow state change re-rendering all 10
visible-page cells per column — that gap (10 vs the ideal 0–2) is the
amplification surface a perf PR should close.

## How to run

```bash
# Wall-clock benches (from the repo root):
bun run bench

# Or directly:
bun run --filter=bench bench

# Deterministic cell-render-count probe:
bun run --filter=bench test
```

Typecheck the workspace on its own:

```bash
bun run --filter=bench typecheck
```

The bench runner uses Vitest's built-in `bench()` API (tinybench under the
hood) with a 1-second time budget and a 5-iteration floor per case. The
whole suite takes ~20s on an M2. The cell-render-count probe runs as a
normal `vitest run` and finishes in ~2s.

## Current baseline

Captured on:

- **CPU:** Apple M2
- **OS:** Darwin 25.3.0 arm64 (macOS 15)
- **Node:** v25.2.1
- **Bun:** 1.3.2
- **Vitest:** 4.1.5

```
mount — 1k rows
  initial mount, no virtualization (1k)   ~34 hz   p75 ~32 ms
  initial mount, virtualized (1k)         ~55 hz   p75 ~22 ms
  → virtualized 1.62× faster

sort change after mount — 1k rows
  mount + setSorting, no virtualization (1k)   ~24 hz   p75 ~44 ms
  mount + setSorting, virtualized (1k)         ~48 hz   p75 ~23 ms
  → virtualized 2.01× faster

narrow state change after mount — 1k rows (all virtualized)
  mount + setHoveredRow      ~60 hz   p75 ~19 ms
  mount + setEditingCell     ~59 hz   p75 ~20 ms
  mount + setDraggingColumn  ~60 hz   p75 ~20 ms
  mount + setColumnFilters   ~56 hz   p75 ~21 ms

mount — 10k rows
  initial mount, no virtualization (10k)   ~16 hz   p75 ~79 ms
  initial mount, virtualized (10k)         ~18 hz   p75 ~58 ms
  → virtualized 1.19× faster

sort change after mount — 10k rows
  mount + setSorting, no virtualization (10k)   ~11 hz   p75 ~99 ms
  mount + setSorting, virtualized (10k)         ~14 hz   p75 ~77 ms
  → virtualized 1.27× faster

narrow state change after mount — 10k rows (all virtualized)
  mount + setHoveredRow      ~21 hz   p75 ~53 ms
  mount + setEditingCell     ~21 hz   p75 ~52 ms
  mount + setDraggingColumn  ~20 hz   p75 ~53 ms
  mount + setColumnFilters   ~17 hz   p75 ~63 ms

mount — 50k rows
  initial mount, no virtualization (50k)   [skipped]
  initial mount, virtualized (50k)         ~4.2 hz   p75 ~290 ms

sort change after mount — 50k rows
  mount + setSorting, no virtualization (50k)   [skipped]
  mount + setSorting, virtualized (50k)         ~2.8 hz   p75 ~332 ms
```

Note how `mount + setHoveredRow` and `mount + initial mount, virtualized`
at 1k come in at roughly the same hz (~60 vs ~55). That's the
amplification: hovering one row costs as much as mounting all 1k rows
again, because every visible cell re-renders on the hover. The whole
point of the upcoming perf work is to break that equivalence.

## Caveats

- **Noisy across machines.** A 20% swing run-to-run on the same M2 is
  normal. Differences smaller than ~30% between branches are not
  meaningful.
- **happy-dom, not a real browser.** These numbers measure React + the
  table's render path, not paint or layout. Real-world feel is best
  evaluated via the playground app.
- **Same-process state.** All benches run in one Vitest worker. Each
  iteration mounts into a fresh container and unmounts cleanly, but
  long-tail GC pressure can affect later cases. Run the suite twice if a
  number looks suspicious.
- **Virtualization-on-1k is realistic but rarely necessary.** A 1.7× edge
  at 1k rows is the row-virtualizer's overhead being smaller than the
  cost of rendering 1k × 4 cells; consumers should still use the
  un-virtualized variant for small datasets so they get clean
  copy-paste / find-in-page behavior.

## Out of scope (follow-ups)

- CI integration with wall-clock regression-gating (numbers too noisy
  without pinned hardware). Cell-render-count snapshots, on the other
  hand, are deterministic and **could** be CI-gated.
- Cross-browser timing (Playwright + real Chromium) — would catch paint
  costs (CSS transitions, sticky-pos recompute) that happy-dom can't see.
- Memory snapshots for GC-pressure-driven cases.
