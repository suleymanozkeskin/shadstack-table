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
 *
 * After mount, the table instance is exposed at `window.__sstBench` so the
 * Playwright script can drive setters directly without hunting through DOM.
 * Performance marks bracket every action so the script can read them via
 * `performance.getEntriesByType('mark')`.
 */
import { useEffect } from 'react';
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

function readParams() {
  const url = new URL(window.location.href);
  const rows = Number(url.searchParams.get('rows') ?? '1000');
  const raw = url.searchParams.get('memoMode') ?? 'cells';
  const memoMode = (['cells', 'rows', 'off'].includes(raw) ? raw : 'cells') as
    | 'cells'
    | 'rows'
    | 'off';
  return { rows, memoMode };
}

declare global {
  interface Window {
    __sstBench?: ReturnType<typeof useShadStackTable<Row>>;
    __sstBenchReady?: boolean;
  }
}

export function BenchHarness() {
  const { rows, memoMode } = readParams();
  const data = makeRows(rows);
  const table = useShadStackTable({
    columns,
    data,
    enableRowVirtualization: rows >= 1000,
    memoMode,
  });

  useEffect(() => {
    window.__sstBench = table;
    window.__sstBenchReady = true;
    return () => {
      window.__sstBench = undefined;
      window.__sstBenchReady = false;
    };
  }, [table]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8, fontFamily: 'monospace', fontSize: 12 }}>
        rows={rows} memoMode={memoMode}
      </div>
      <ShadStackTable table={table} />
    </div>
  );
}
