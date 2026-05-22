/**
 * Deterministic counterpart to `render.bench.tsx`.
 *
 * Wall-clock numbers in the bench suite are noisy (the README itself says
 * <30% diffs aren't meaningful). To detect render-amplification — where a
 * narrow state change like `setHoveredRow` ends up re-rendering every visible
 * cell — we need a metric that isn't sensitive to CPU load or GC timing.
 *
 * The probe here is **how many times each column's `Cell` renderer runs**
 * after a single narrow state change. The renderer is invoked once per
 * `<SST_TableBodyCell>` render, so the counter directly reflects how many
 * cells React reconciled into the table body. Mount counts and update counts
 * are both snapshotted so reviewers see the gap.
 *
 * The numbers in the inline snapshots below describe **current behavior**,
 * not the desired end-state. The whole point is for performance fixes to
 * shrink them, with the diff in each PR showing the win.
 */

import { act, Profiler, type ProfilerOnRenderCallback, type ReactElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  ShadStackTable,
  type SST_ColumnDef,
  type SST_TableInstance,
  useShadStackTable,
} from 'shadstack-table';
import { describe, expect, test } from 'vitest';
import { type BenchPerson, makePeople } from './fixtures';

type MemoMode = 'cells' | 'rows' | undefined;

// Small enough that the test stays fast in happy-dom (a few hundred ms),
// large enough that an amplification bug shows up as a 100×+ gap rather than
// a borderline 2× one. Unvirtualized so every cell is actually rendered and
// counted — virtualization in happy-dom is non-deterministic without a real
// viewport.
const ROW_COUNT = 100;

type CellCounts = {
  firstName: number;
  lastName: number;
};

const makeInstrumentedColumns = (counts: CellCounts): SST_ColumnDef<BenchPerson>[] => [
  {
    accessorKey: 'firstName',
    header: 'First name',
    Cell: ({ renderedCellValue }) => {
      counts.firstName += 1;
      return renderedCellValue;
    },
  },
  {
    accessorKey: 'lastName',
    header: 'Last name',
    Cell: ({ renderedCellValue }) => {
      counts.lastName += 1;
      return renderedCellValue;
    },
  },
];

type Harness = { root: Root; container: HTMLDivElement };

const mount = (element: ReactElement): Harness => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return { root, container };
};

const teardown = ({ root, container }: Harness) => {
  act(() => {
    root.unmount();
  });
  container.remove();
};

type NarrowAction = (table: SST_TableInstance<BenchPerson>) => void;

type ProbeProps = {
  data: BenchPerson[];
  columns: SST_ColumnDef<BenchPerson>[];
  action: NarrowAction | null;
  memoMode: MemoMode;
  onTable: (table: SST_TableInstance<BenchPerson>) => void;
};

// Captures the table instance for the test and optionally fires a single
// narrow state change after the initial commit. The effect dep array uses
// `action` directly so passing `null` keeps mount-only behavior — useful for
// the "mount baseline" snapshot below.
const Probe = ({ data, columns, action, memoMode, onTable }: ProbeProps) => {
  const table = useShadStackTable({
    columns,
    data,
    enableRowVirtualization: false,
    memoMode,
  });

  useEffect(() => {
    onTable(table);
    if (action) action(table);
  }, [table, action, onTable]);

  return <ShadStackTable table={table} />;
};

// Mount once, drain mount-phase cell counts, run the narrow action under
// `act`, then return the *delta* — i.e. cells re-rendered solely because of
// the action. That delta is what amplification bugs inflate.
const measureAmplification = (action: NarrowAction, memoMode: MemoMode = undefined) => {
  const data = makePeople(ROW_COUNT);
  const counts: CellCounts = { firstName: 0, lastName: 0 };
  const columns = makeInstrumentedColumns(counts);

  let capturedTable: SST_TableInstance<BenchPerson> | null = null;
  const onTable = (t: SST_TableInstance<BenchPerson>) => {
    capturedTable = t;
  };

  // Profiler captures commit phases as an orthogonal sanity check — if commit
  // count balloons it usually means an effect is firing in a loop. We don't
  // assert on durations (noisy) but we do snapshot the commit count.
  const commits: Array<{ phase: 'mount' | 'update' | 'nested-update' }> = [];
  const onRender: ProfilerOnRenderCallback = (_id, phase) => {
    commits.push({ phase });
  };

  // Mount with no action — measures cells rendered just to put the table on
  // screen. Capturing the table is the only side-effect of the mount effect.
  const handle = mount(
    <Profiler id="table" onRender={onRender}>
      <Probe data={data} columns={columns} action={null} memoMode={memoMode} onTable={onTable} />
    </Profiler>,
  );

  const mountCounts: CellCounts = { ...counts };
  const mountCommits = commits.length;

  // Reset before triggering the narrow change so the next totals describe
  // only the update-phase work.
  counts.firstName = 0;
  counts.lastName = 0;
  commits.length = 0;

  if (!capturedTable) throw new Error('Probe never captured the table instance');
  act(() => {
    action(capturedTable!);
  });

  const updateCounts: CellCounts = { ...counts };
  const updateCommits = commits.length;

  teardown(handle);

  return {
    rows: ROW_COUNT,
    mount: { ...mountCounts, commits: mountCommits },
    update: { ...updateCounts, commits: updateCommits },
  };
};

describe('cell-render counts under narrow state changes (100 rows, unvirtualized)', () => {
  test('setHoveredRow — ideally renders ~1 row of cells', () => {
    const result = measureAmplification((table) => {
      const target = table.getRowModel().rows[5];
      if (target) table.setHoveredRow(target);
    });

    // Snapshot captures current (pre-fix) behavior. After the Tier 1
    // hover-amplification fix lands, this snapshot should drop sharply on the
    // `update` side and the diff in the PR will document the win.
    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 2,
          "firstName": 10,
          "lastName": 10,
        },
      }
    `);
  });

  test('setEditingCell — ideally renders ~1 cell', () => {
    const result = measureAmplification((table) => {
      const target = table.getRowModel().rows[5]?.getAllCells()[0];
      if (target) table.setEditingCell(target);
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 2,
          "firstName": 10,
          "lastName": 10,
        },
      }
    `);
  });

  test('setDraggingColumn — should not touch body cells at all', () => {
    const result = measureAmplification((table) => {
      const target = table.getAllLeafColumns()[1];
      if (target) table.setDraggingColumn(target);
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 2,
          "firstName": 10,
          "lastName": 10,
        },
      }
    `);
  });

  test('setColumnFilters — re-renders matching rows only', () => {
    const result = measureAmplification((table) => {
      // 'a' matches the majority of the fixture first-names, so this
      // exercises the highlightWords path on most rows rather than no-ops.
      table.setColumnFilters([{ id: 'firstName', value: 'a' }]);
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 3,
          "firstName": 10,
          "lastName": 10,
        },
      }
    `);
  });
});

// Same scenarios with `memoMode='cells'` — Tier 1 refactor hoisted state out
// of the cell component and made the memo comparator shallow-equal on
// primitive props. These snapshots are where the win shows up: hovering,
// editing, or dragging should now bail the memo for cells whose narrow
// props didn't change, dropping the update cell-render count toward 0–1
// instead of "every visible cell".
describe('cell-render counts with memoMode=cells (Tier 1 win surface)', () => {
  test('setHoveredRow — only the hovered row should re-render', () => {
    const result = measureAmplification((table) => {
      const target = table.getRowModel().rows[5];
      if (target) table.setHoveredRow(target);
    }, 'cells');

    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 2,
          "firstName": 1,
          "lastName": 1,
        },
      }
    `);
  });

  test('setEditingCell — only the edited cell should re-render', () => {
    const result = measureAmplification((table) => {
      const target = table.getRowModel().rows[5]?.getAllCells()[0];
      if (target) table.setEditingCell(target);
    }, 'cells');

    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 2,
          "firstName": 1,
          "lastName": 0,
        },
      }
    `);
  });

  test('setDraggingColumn — body cells should not re-render at all', () => {
    const result = measureAmplification((table) => {
      const target = table.getAllLeafColumns()[1];
      if (target) table.setDraggingColumn(target);
    }, 'cells');

    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 2,
          "firstName": 0,
          "lastName": 10,
        },
      }
    `);
  });

  test('setColumnFilters — only matched rows should re-render', () => {
    const result = measureAmplification((table) => {
      table.setColumnFilters([{ id: 'firstName', value: 'a' }]);
    }, 'cells');

    expect(result).toMatchInlineSnapshot(`
      {
        "mount": {
          "commits": 5,
          "firstName": 10,
          "lastName": 10,
        },
        "rows": 100,
        "update": {
          "commits": 3,
          "firstName": 10,
          "lastName": 10,
        },
      }
    `);
  });
});
