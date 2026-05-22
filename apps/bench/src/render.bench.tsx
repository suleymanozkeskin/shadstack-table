/**
 * Render benchmarks for ShadStackTable.
 *
 * Three scenarios are measured at three dataset sizes (1k / 10k / 50k):
 *
 *   1. Initial mount — bare <ShadStackTable> with N rows.
 *   2. Initial mount with `enableRowVirtualization: true` — the realistic
 *      large-dataset shape; the only scenario consumers should ever ship for
 *      10k+ rows.
 *   3. Sort change after mount — initial render + a controlled
 *      `setSorting(...)` call so React reconciles a second pass over the
 *      same dataset.
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
import { ShadStackTable, type SST_SortingState, useShadStackTable } from 'shadstack-table';
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
}
