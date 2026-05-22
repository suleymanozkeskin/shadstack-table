# `shadstack-table` render benchmarks

Render-time benchmarks for `ShadStackTable` at 1k / 10k / 50k rows. Used to
spot order-of-magnitude regressions during local review — **not** wired up as
a CI gate, since the numbers are noisy across machines.

## What's measured

Three scenarios at each dataset size:

1. **Initial mount, no virtualization** — bare `<ShadStackTable>` with N
   rows, all rows rendered.
2. **Initial mount, virtualized** — same dataset with
   `enableRowVirtualization: true`. This is the realistic shape for 10k+
   rows.
3. **Mount + `setSorting(...)` after mount** — initial render plus a
   controlled `useEffect` that calls `table.setSorting(...)` once, so React
   reconciles a second pass over the same dataset. Measured with and
   without virtualization.

The 50k unvirtualized cases are skipped on purpose: rendering 50k rows × 4
columns of full table cells under happy-dom takes multiple seconds per
sample and provides no actionable signal — anyone shipping unvirtualized
50k rows already has bigger problems.

Total: **8 benchmark cases** (3 sizes × 3 scenarios − 2 skipped 50k
unvirtualized).

## How to run

```bash
# From the repo root:
bun run bench

# Or directly:
bun run --filter=bench bench
```

Typecheck the workspace on its own:

```bash
bun run --filter=bench typecheck
```

The bench runner uses Vitest's built-in `bench()` API (tinybench under the
hood) with a 1-second time budget and a 5-iteration floor per case. The
whole suite takes ~20s on an M2.

## Current baseline

Captured on:

- **CPU:** Apple M2
- **OS:** Darwin 25.3.0 arm64 (macOS 15)
- **Node:** v25.2.1
- **Bun:** 1.3.2
- **Vitest:** 4.1.5

```
mount — 1k rows
  initial mount, no virtualization (1k)   ~32 hz   p75 ~34 ms
  initial mount, virtualized (1k)         ~57 hz   p75 ~21 ms
  → virtualized 1.74× faster

sort change after mount — 1k rows
  mount + setSorting, no virtualization (1k)   ~27 hz   p75 ~37 ms
  mount + setSorting, virtualized (1k)         ~50 hz   p75 ~24 ms
  → virtualized 1.84× faster

mount — 10k rows
  initial mount, no virtualization (10k)   ~16 hz   p75 ~64 ms
  initial mount, virtualized (10k)         ~21 hz   p75 ~52 ms
  → virtualized 1.26× faster

sort change after mount — 10k rows
  mount + setSorting, no virtualization (10k)   ~11 hz   p75 ~99 ms
  mount + setSorting, virtualized (10k)         ~13 hz   p75 ~78 ms
  → virtualized 1.17× faster

mount — 50k rows
  initial mount, no virtualization (50k)   [skipped]
  initial mount, virtualized (50k)         ~4.7 hz   p75 ~225 ms

sort change after mount — 50k rows
  mount + setSorting, no virtualization (50k)   [skipped]
  mount + setSorting, virtualized (50k)         ~2.7 hz   p75 ~395 ms
```

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

- CI integration with regression-gating (numbers too noisy without
  pinned hardware).
- React Profiler-based per-component cost breakdown.
- Cross-browser timing (Playwright + real Chromium).
