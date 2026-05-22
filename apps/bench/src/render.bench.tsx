/**
 * Render benchmarks for ShadStackTable.
 *
 * Two flavours of scenario at three dataset sizes (1k / 10k / 50k):
 *
 *   Full-rerender scenarios — every visible cell is expected to re-render:
 *     1. Initial mount — bare <ShadStackTable> with N rows.
 *     2. Initial mount with `enableRowVirtualization: true` — the realistic
 *        large-dataset shape; the only scenario consumers should ever ship
 *        for 10k+ rows.
 *     3. Sort change after mount — initial render + a controlled
 *        `setSorting(...)` call so React reconciles a second pass over the
 *        same dataset.
 *
 *   Narrow-state-change scenarios — only a small slice of UI conceptually
 *   needs to update, so the gap between these and a full rerender measures
 *   render-amplification (e.g. hovering one row re-rendering every cell):
 *     4. mount + setHoveredRow — should only re-render the hovered row.
 *     5. mount + setEditingCell — should only re-render the edited cell.
 *     6. mount + setDraggingColumn — should only re-render header cells.
 *     7. mount + setColumnFilters — exercises the highlightWords text path.
 *
 *   See `commit-counts.test.tsx` for the deterministic counterpart to (4–7)
 *   — wall-clock here is noisy but commit counts there are not.
 *
 * Numbers are noisy across machines and intentionally NOT a CI gate — these
 * benches exist so we can spot order-of-magnitude regressions during local
 * review. See `apps/bench/README.md` for the current baseline.
 *
 * NOTE on the 50k × unvirtualized case: rendering 50k rows × 4 columns of
 * full table cells under happy-dom is genuinely slow (multiple seconds per
 * sample) and provides no actionable signal — anyone shipping unvirtualized
 * 50k rows already has bigger problems. It is skipped explicitly so the rest
 * of the suite can complete in a reasonable wall-clock time.
 */

import { act, type ReactElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  ShadStackTable,
  type SST_SortingState,
  type SST_TableInstance,
  useShadStackTable,
} from 'shadstack-table';
import { bench, describe } from 'vitest';
import { benchColumns, type BenchPerson, makePeople } from './fixtures';

// happy-dom carries DOM state across iterations within the same process.
// Each bench cycle mounts fresh into a brand-new container so we measure
// initial-render cost, not re-render-into-existing-tree cost.
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

// Inner harness for "sort change after mount" — uses the table-instance
// prop on <ShadStackTable> so we can drive `setSorting` from a child effect.
// The effect fires exactly once per bench iteration; that second render is
// the post-mount sort change we want to time.
type SortTriggerProps = {
  data: BenchPerson[];
  enableRowVirtualization: boolean;
};

const SortTrigger = ({ data, enableRowVirtualization }: SortTriggerProps) => {
  const table = useShadStackTable({
    columns: benchColumns,
    data,
    enableRowVirtualization,
  });

  useEffect(() => {
    const next: SST_SortingState = [{ id: 'lastName', desc: false }];
    table.setSorting(next);
  }, [table]);

  return <ShadStackTable table={table} />;
};

const SIZES = [
  { label: '1k', n: 1_000 },
  { label: '10k', n: 10_000 },
  { label: '50k', n: 50_000 },
] as const;

// Tight bench budgets keep the suite from ballooning at 50k rows.
// 5 iterations × ~1s each at the worst size is acceptable; smaller sizes
// get more samples naturally inside `time`.
const benchOpts = { time: 1_000, iterations: 5, warmupIterations: 1, warmupTime: 200 };

// Generic harness for "narrow state change after mount". Same shape as
// SortTrigger but parameterized over the setter call so each scenario stays a
// one-liner. The action runs inside a useEffect after the initial commit, so
// the bench measures mount + a single follow-up render driven by that action.
type NarrowAction = (table: SST_TableInstance<BenchPerson>) => void;

type NarrowTriggerProps = {
  data: BenchPerson[];
  action: NarrowAction;
};

const NarrowTrigger = ({ data, action }: NarrowTriggerProps) => {
  const table = useShadStackTable({
    columns: benchColumns,
    data,
    enableRowVirtualization: true,
  });

  useEffect(() => {
    action(table);
  }, [table, action]);

  return <ShadStackTable table={table} />;
};

// Scenario actions — each picks a target out of the live table instance so we
// don't ship a stale Row/Cell/Column reference into a setter that expects a
// live one. Targets are chosen at index 5 to land inside the virtualized
// window without depending on the exact overscan default.
const hoverRowAction: NarrowAction = (table) => {
  const rows = table.getRowModel().rows;
  const target = rows[5] ?? rows[0];
  if (target) table.setHoveredRow(target);
};

const editCellAction: NarrowAction = (table) => {
  const rows = table.getRowModel().rows;
  const target = (rows[5] ?? rows[0])?.getAllCells()[0];
  if (target) table.setEditingCell(target);
};

const dragColumnAction: NarrowAction = (table) => {
  const cols = table.getAllLeafColumns();
  const target = cols[1] ?? cols[0];
  if (target) table.setDraggingColumn(target);
};

const filterAction: NarrowAction = (table) => {
  // 'a' matches the majority of fixture first-names (Ada, Margaret, Alan,
  // Barbara, Karen, ...) so the highlightWords path is actually exercised
  // on most visible rows rather than no-ops.
  table.setColumnFilters([{ id: 'firstName', value: 'a' }]);
};

for (const { label, n } of SIZES) {
  describe(`mount — ${label} rows`, () => {
    const data = makePeople(n);

    bench.skipIf(n >= 50_000)(
      `initial mount, no virtualization (${label})`,
      () => {
        const handle = mount(<ShadStackTable columns={benchColumns} data={data} />);
        teardown(handle);
      },
      benchOpts,
    );

    bench(
      `initial mount, virtualized (${label})`,
      () => {
        const handle = mount(
          <ShadStackTable columns={benchColumns} data={data} enableRowVirtualization />,
        );
        teardown(handle);
      },
      benchOpts,
    );
  });

  describe(`sort change after mount — ${label} rows`, () => {
    const data = makePeople(n);

    bench.skipIf(n >= 50_000)(
      `mount + setSorting, no virtualization (${label})`,
      () => {
        const handle = mount(<SortTrigger data={data} enableRowVirtualization={false} />);
        teardown(handle);
      },
      benchOpts,
    );

    bench(
      `mount + setSorting, virtualized (${label})`,
      () => {
        const handle = mount(<SortTrigger data={data} enableRowVirtualization />);
        teardown(handle);
      },
      benchOpts,
    );
  });

  // Narrow-state-change scenarios. Only the virtualized variant is benched
  // since these probes are about render-amplification, not raw mount cost —
  // unvirtualized at 10k+ would be dominated by mount and obscure the signal.
  // Skipped at 50k for the same reason the existing sort/mount cases throttle
  // back there: the time budget is better spent on actionable sizes.
  describe(`narrow state change after mount — ${label} rows`, () => {
    const data = makePeople(n);

    bench.skipIf(n >= 50_000)(
      `mount + setHoveredRow, virtualized (${label})`,
      () => {
        const handle = mount(<NarrowTrigger data={data} action={hoverRowAction} />);
        teardown(handle);
      },
      benchOpts,
    );

    bench.skipIf(n >= 50_000)(
      `mount + setEditingCell, virtualized (${label})`,
      () => {
        const handle = mount(<NarrowTrigger data={data} action={editCellAction} />);
        teardown(handle);
      },
      benchOpts,
    );

    bench.skipIf(n >= 50_000)(
      `mount + setDraggingColumn, virtualized (${label})`,
      () => {
        const handle = mount(<NarrowTrigger data={data} action={dragColumnAction} />);
        teardown(handle);
      },
      benchOpts,
    );

    bench.skipIf(n >= 50_000)(
      `mount + setColumnFilters, virtualized (${label})`,
      () => {
        const handle = mount(<NarrowTrigger data={data} action={filterAction} />);
        teardown(handle);
      },
      benchOpts,
    );
  });
}
