/**
 * Minimal harness for real-browser benchmarking (Playwright bench script in
 * apps/bench/playwright/). The normal Playground is too feature-rich and its
 * AdvancedExample renders detail panels + custom toolbars that would
 * dominate the measurements we want — this strips down to a single
 * configurable table.
 *
 * Activated via `?bench=true` in App.tsx so the normal interactive
 * playground stays untouched.
 *
 * Supported URL params:
 *   - `rows` (default 1000): row count
 *   - `memoMode` (default 'cells'): 'cells' | 'rows' | 'off'
 *   - `action` (default 'hover'): 'hover' | 'orderbook'
 *
 * For `action=hover`:
 *   - Exposes the table instance at `window.__sstBench` so the Playwright
 *     script can drive setHoveredRow / setEditingCell / etc. directly.
 *
 * For `action=orderbook`:
 *   - Additional params: `rate` (Hz, default 60), `batch` (rows mutated
 *     per tick, default 50), `duration` (ms, default 5000).
 *   - Exposes `window.__sstBenchStart()` to kick off the update loop and
 *     `window.__sstBenchStats` to read the result once `window.__sstBenchDone`
 *     flips true. Stats use a React Profiler so we get per-commit timings
 *     under real-browser layout/paint cost, not happy-dom's no-op DOM.
 */
import { Profiler, type ProfilerOnRenderCallback, useEffect, useRef, useState } from 'react';
import { ShadStackTable, type SST_ColumnDef, useShadStackTable } from 'shadstack-table';

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
};

const FIRST = ['Ada', 'Grace', 'Linus', 'Margaret', 'Edsger', 'Alan', 'Barbara', 'Donald'];
const LAST = ['Lovelace', 'Hopper', 'Torvalds', 'Hamilton', 'Dijkstra', 'Turing', 'Liskov'];

// Deterministic LCG so different runs against the same row count produce
// the same data — comparing memoMode=cells vs memoMode=off must control for
// data shape.
function* lcg(seed: number) {
  let s = seed >>> 0;
  while (true) {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;
    yield s / 0x1_00_00_00_00;
  }
}

function makeRows(n: number): Row[] {
  const r = lcg(0xc0_ff_ee);
  const rows: Row[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const first = FIRST[Math.floor(r.next().value! * FIRST.length)]!;
    const last = LAST[Math.floor(r.next().value! * LAST.length)]!;
    const age = 18 + Math.floor(r.next().value! * 60);
    rows[i] = {
      id: `p${i.toString().padStart(7, '0')}`,
      firstName: first,
      lastName: last,
      age,
      email: `${first.toLowerCase()}.${last.toLowerCase()}.${i}@example.test`,
    };
  }
  return rows;
}

const columns: SST_ColumnDef<Row>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'email', header: 'Email' },
];

type Action = 'hover' | 'orderbook';
type MemoMode = 'cells' | 'rows' | 'off';

type Params = {
  rows: number;
  memoMode: MemoMode;
  action: Action;
  // orderbook only
  rate: number;
  batch: number;
  duration: number;
};

function readParams(): Params {
  const url = new URL(window.location.href);
  const get = (k: string) => url.searchParams.get(k);
  const rows = Number(get('rows') ?? '1000');
  const rawMemo = get('memoMode') ?? 'cells';
  const memoMode = (['cells', 'rows', 'off'].includes(rawMemo) ? rawMemo : 'cells') as MemoMode;
  const rawAction = get('action') ?? 'hover';
  const action = (['hover', 'orderbook'].includes(rawAction) ? rawAction : 'hover') as Action;
  return {
    rows,
    memoMode,
    action,
    rate: Number(get('rate') ?? '60'),
    batch: Number(get('batch') ?? '50'),
    duration: Number(get('duration') ?? '5000'),
  };
}

type OrderbookStats = {
  durationMs: number;
  commits: number;
  meanCommitMs: number;
  maxCommitMs: number;
  p50CommitMs: number;
  p75CommitMs: number;
  p95CommitMs: number;
  updates: number;
  commitsPerSecond: number;
  updatesPerSecond: number;
};

declare global {
  interface Window {
    __sstBench?: ReturnType<typeof useShadStackTable<Row>>;
    __sstBenchReady?: boolean;
    __sstBenchStart?: () => void;
    __sstBenchDone?: boolean;
    __sstBenchStats?: OrderbookStats;
  }
}

// Mutate `batch` random rows by re-creating each as a new immutable object
// with bumped age (so the comparator must propagate the change). The row
// id stays stable so getRowId preserves identity — same shape as the
// orderbook/streaming-data scenario the reviewer asked us to validate.
function applyOrderbookUpdate(prev: Row[], batch: number, seedRef: { current: number }): Row[] {
  if (prev.length === 0) return prev;
  const next = prev.slice();
  const len = prev.length;
  for (let i = 0; i < batch; i++) {
    // xorshift32 — cheap deterministic next-int, no hot-path allocation.
    let s = seedRef.current;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    seedRef.current = s;
    const idx = (s >>> 0) % len;
    const row = next[idx]!;
    next[idx] = { ...row, age: ((row.age + 1) % 80) + 18 };
  }
  return next;
}

export function BenchHarness() {
  const params = readParams();
  const [data, setData] = useState(() => makeRows(params.rows));
  const table = useShadStackTable({
    columns,
    data,
    enableRowVirtualization: params.rows >= 1000,
    memoMode: params.memoMode,
    getRowId: (row) => row.id,
  });

  // Hover-action plumbing — same shape as before.
  useEffect(() => {
    if (params.action !== 'hover') return;
    window.__sstBench = table;
    window.__sstBenchReady = true;
    return () => {
      window.__sstBench = undefined;
      window.__sstBenchReady = false;
    };
  }, [params.action, table]);

  // Orderbook-action plumbing — exposes __sstBenchStart so the Playwright
  // script can decide *when* the timed window opens (after warmup, after
  // the page has settled, etc.). Stats collection lives in a ref so the
  // render path isn't disturbed by setState during measurement.
  const commitsRef = useRef<number[]>([]);
  const updatesRef = useRef(0);
  const seedRef = useRef(0xca_fe_ba_be);
  const intervalRef = useRef<number | null>(null);
  const stopAtRef = useRef<number | null>(null);

  const onRender = useRef<ProfilerOnRenderCallback>((_id, _phase, actualDuration) => {
    // Only collect during the timed window. Pre-start: no-op so warmup
    // commits don't pollute the sample.
    if (stopAtRef.current === null) return;
    commitsRef.current.push(actualDuration);
  });

  useEffect(() => {
    if (params.action !== 'orderbook') return;
    window.__sstBenchStart = () => {
      commitsRef.current = [];
      updatesRef.current = 0;
      window.__sstBenchDone = false;
      window.__sstBenchStats = undefined;
      const start = performance.now();
      stopAtRef.current = start + params.duration;

      const tick = () => {
        const now = performance.now();
        if (now >= stopAtRef.current!) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // Compute stats. Sort once, then read percentiles.
          const samples = commitsRef.current.slice().sort((a, b) => a - b);
          const sum = samples.reduce((a, b) => a + b, 0);
          const pct = (q: number) =>
            samples.length === 0
              ? 0
              : samples[Math.min(samples.length - 1, Math.floor(samples.length * q))]!;
          const elapsed = now - start;
          window.__sstBenchStats = {
            durationMs: elapsed,
            commits: samples.length,
            meanCommitMs: samples.length ? sum / samples.length : 0,
            maxCommitMs: samples.length ? samples[samples.length - 1]! : 0,
            p50CommitMs: pct(0.5),
            p75CommitMs: pct(0.75),
            p95CommitMs: pct(0.95),
            updates: updatesRef.current,
            commitsPerSecond: samples.length / (elapsed / 1000),
            updatesPerSecond: updatesRef.current / (elapsed / 1000),
          };
          stopAtRef.current = null;
          window.__sstBenchDone = true;
          return;
        }
        updatesRef.current += params.batch;
        setData((prev) => applyOrderbookUpdate(prev, params.batch, seedRef));
      };

      intervalRef.current = window.setInterval(tick, 1000 / params.rate);
    };
    window.__sstBenchReady = true;
    return () => {
      window.__sstBenchStart = undefined;
      window.__sstBenchReady = false;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [params.action, params.duration, params.batch, params.rate]);

  const content = (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8, fontFamily: 'monospace', fontSize: 12 }}>
        action={params.action} rows={params.rows} memoMode={params.memoMode}
        {params.action === 'orderbook'
          ? ` rate=${params.rate}Hz batch=${params.batch} duration=${params.duration}ms`
          : ''}
      </div>
      <ShadStackTable table={table} />
    </div>
  );

  // Profiler only wraps the orderbook scenario — hover path doesn't need it
  // and the wrapper itself isn't free.
  if (params.action === 'orderbook') {
    return (
      <Profiler id="bench-orderbook" onRender={(...args) => onRender.current(...args)}>
        {content}
      </Profiler>
    );
  }
  return content;
}
