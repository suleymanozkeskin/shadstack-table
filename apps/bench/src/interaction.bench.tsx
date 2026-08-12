/**
 * Interaction benchmarks for ShadStackTable.
 *
 * The mount benches in `render.bench.tsx` measure initial render and row-model
 * cost, which per-slice subscriptions barely touch. These measure what the
 * granular-subscription work actually targets: the cost of one interaction
 * tick on an ALREADY-MOUNTED table — hover moves, selection clicks, editing
 * entry, page flips, density toggles. Each bench drives the public setter
 * inside `act` so the number includes React's re-render work for exactly the
 * components that subscribe to the written slice.
 *
 * The table mounts once per describe block; iterations mutate state in cycles
 * that return to a steady shape, so samples stay comparable.
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ShadStackTable,
  type SST_Row,
  type SST_TableInstance,
  useShadStackTable,
} from 'shadstack-table';
import { bench, describe } from 'vitest';
import { benchColumns, type BenchPerson, makePeople } from './fixtures';

const benchOpts = { time: 1_000, iterations: 20, warmupIterations: 3, warmupTime: 200 };

const setup = (n: number) => {
  const data = makePeople(n);
  let table!: SST_TableInstance<BenchPerson>;
  const Harness = () => {
    table = useShadStackTable<BenchPerson>({
      columns: benchColumns,
      data,
      enableEditing: true,
      enableRowOrdering: true,
      enableRowSelection: true,
      enableRowVirtualization: true,
      editDisplayMode: 'cell',
    });
    return <ShadStackTable table={table} />;
  };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Harness />);
  });
  return { rows: () => table.getRowModel().rows, table: () => table };
};

for (const n of [10_000, 50_000]) {
  describe(`interaction — ${(n / 1000) | 0}k rows, virtualized`, () => {
    const h = setup(n);
    let i = 0;

    bench(
      'hover row while dragging',
      () => {
        const rows = h.rows();
        const table = h.table();
        act(() => table.setDraggingRow(rows[0] as SST_Row<BenchPerson>));
        act(() => table.setHoveredRow(rows[++i % 8] as SST_Row<BenchPerson>));
        act(() => {
          table.setDraggingRow(null);
          table.setHoveredRow(null);
        });
      },
      benchOpts,
    );

    bench(
      'toggle one row selection',
      () => {
        const rows = h.rows();
        const row = rows[++i % 8]!;
        act(() => row.toggleSelected(true));
        act(() => row.toggleSelected(false));
      },
      benchOpts,
    );

    bench(
      'enter + exit cell editing',
      () => {
        const rows = h.rows();
        const cell = rows[++i % 8]!.getAllCells()[1]!;
        const table = h.table();
        act(() => table.setEditingCell(cell));
        act(() => table.setEditingCell(null));
      },
      benchOpts,
    );

    bench(
      'page flip forward and back',
      () => {
        const table = h.table();
        act(() => table.setPageIndex(1));
        act(() => table.setPageIndex(0));
      },
      benchOpts,
    );

    bench(
      'density toggle',
      () => {
        const table = h.table();
        act(() => table.setDensity('compact'));
        act(() => table.setDensity('comfortable'));
      },
      benchOpts,
    );

    //LAST in the block: it leaves the drag active, which would skew any
    //bench that ran after it
    let dragStarted = false;
    bench(
      'hover move with drag held',
      () => {
        const rows = h.rows();
        const table = h.table();
        if (!dragStarted) {
          dragStarted = true;
          act(() => table.setDraggingRow(rows[0] as SST_Row<BenchPerson>));
        }
        act(() => table.setHoveredRow(rows[++i % 8] as SST_Row<BenchPerson>));
      },
      benchOpts,
    );
  });
}
