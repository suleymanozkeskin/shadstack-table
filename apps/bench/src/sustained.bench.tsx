/**
 * Sustained-interaction benchmarks for memoMode.
 *
 * The scenarios in `render.bench.tsx` mount the table and fire ONE narrow
 * state change per iteration. The comparator overhead of `memoMode='cells'`
 * is paid up front (every visible cell goes through `Memo_SST_TableBodyCell`
 * during mount); the savings of 9 cells skipping a re-render are only
 * realised once per iteration. Mount cost dominates, so the wall-clock A/B
 * is a wash even when the deterministic commit-counts test shows the win.
 *
 * Real apps don't mount per hover. They mount the table once and the user
 * then hovers / edits / drags many times. To translate the per-render
 * savings into a wall-clock number we have to mount once and amortise the
 * comparator install over N sustained actions.
 *
 * Each scenario here:
 *   1. Mounts the table inside `act` (effects flushed, instance captured).
 *   2. Fires `SUSTAINED_N` narrow state changes back-to-back, each in its
 *      own `act` so React commits between them instead of batching.
 *   3. Unmounts.
 * The bench times the whole thing. With `SUSTAINED_N = 50` the mount cost
 * is roughly 10–15% of the iteration; the rest is the loop, where the memo
 * delta lives.
 */

import { act, type ReactElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ShadStackTable, type SST_TableInstance, useShadStackTable } from 'shadstack-table';
import { bench, describe } from 'vitest';
import { benchColumns, type BenchPerson, makePeople } from './fixtures';

const mount = (element: ReactElement): { root: Root; container: HTMLDivElement } => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return { root, container };
};

const teardown = ({ root, container }: { root: Root; container: HTMLDivElement }) => {
  act(() => {
    root.unmount();
  });
  container.remove();
};

// Capture the table instance from inside the React tree so the bench loop
// can drive setters directly. The `onTable` callback fires in a mount
// effect; after `mount()` returns, the captured instance is ready.
type CaptureProps = {
  data: BenchPerson[];
  memoMode: 'cells' | 'off';
  onTable: (table: SST_TableInstance<BenchPerson>) => void;
};

const Capture = ({ data, memoMode, onTable }: CaptureProps) => {
  const table = useShadStackTable({
    columns: benchColumns,
    data,
    enableRowVirtualization: true,
    memoMode,
  });
  useEffect(() => {
    onTable(table);
  }, [table, onTable]);
  return <ShadStackTable table={table} />;
};

// 50 actions: enough for the loop to dominate mount cost (mount is ~20ms,
// 50 actions are 50–200ms depending on mode/scenario), short enough to keep
// the whole suite under ~30s.
const SUSTAINED_N = 50;

const SIZES = [
  { label: '1k', n: 1_000 },
  { label: '10k', n: 10_000 },
] as const;

// Budgets: same as render.bench.tsx so noise characteristics stay comparable.
// Sustained scenarios are slower per iteration (50 actions vs 1) so we accept
// fewer samples — the per-iteration cost is what we're measuring anyway.
const benchOpts = { time: 1_500, iterations: 5, warmupIterations: 1, warmupTime: 300 };

const runSustained = (
  data: BenchPerson[],
  memoMode: 'cells' | 'off',
  driveAction: (table: SST_TableInstance<BenchPerson>, i: number) => void,
) => {
  let capturedTable: SST_TableInstance<BenchPerson> | null = null;
  const onTable = (t: SST_TableInstance<BenchPerson>) => {
    capturedTable = t;
  };
  const handle = mount(<Capture data={data} memoMode={memoMode} onTable={onTable} />);
  if (!capturedTable) throw new Error('Capture never received the table instance');
  const table = capturedTable;
  for (let i = 0; i < SUSTAINED_N; i++) {
    act(() => {
      driveAction(table, i);
    });
  }
  teardown(handle);
};

for (const { label, n } of SIZES) {
  describe(`sustained interaction — ${label} rows`, () => {
    const data = makePeople(n);

    // Cycle through 10 visible rows so each hover actually flips state
    // (setting to the same row would no-op the setter and short-circuit
    // the work we want to measure).
    bench(
      `mount + ${SUSTAINED_N}× setHoveredRow, memoMode=cells (${label})`,
      () => {
        runSustained(data, 'cells', (table, i) => {
          const rows = table.getRowModel().rows;
          const target = rows[i % Math.min(rows.length, 10)];
          if (target) table.setHoveredRow(target);
        });
      },
      benchOpts,
    );

    bench(
      `mount + ${SUSTAINED_N}× setHoveredRow, memoMode=off (${label})`,
      () => {
        runSustained(data, 'off', (table, i) => {
          const rows = table.getRowModel().rows;
          const target = rows[i % Math.min(rows.length, 10)];
          if (target) table.setHoveredRow(target);
        });
      },
      benchOpts,
    );

    bench(
      `mount + ${SUSTAINED_N}× setEditingCell, memoMode=cells (${label})`,
      () => {
        runSustained(data, 'cells', (table, i) => {
          const rows = table.getRowModel().rows;
          const row = rows[i % Math.min(rows.length, 10)];
          const cell = row?.getAllCells()[i % 2];
          if (cell) table.setEditingCell(cell);
        });
      },
      benchOpts,
    );

    bench(
      `mount + ${SUSTAINED_N}× setEditingCell, memoMode=off (${label})`,
      () => {
        runSustained(data, 'off', (table, i) => {
          const rows = table.getRowModel().rows;
          const row = rows[i % Math.min(rows.length, 10)];
          const cell = row?.getAllCells()[i % 2];
          if (cell) table.setEditingCell(cell);
        });
      },
      benchOpts,
    );
  });
}
