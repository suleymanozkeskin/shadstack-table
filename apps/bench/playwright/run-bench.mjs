/**
 * Real-browser bench for memoMode='cells' vs memoMode='off'.
 *
 * Two scenarios:
 *   1. `hover` — 200 sustained setHoveredRow calls in a row, one per
 *      requestAnimationFrame so we measure per-action commit+paint cost.
 *      Stresses the narrow-state-change path the memo was designed for.
 *   2. `orderbook` — 5 seconds of immutable data replacement at 60 Hz,
 *      ~50 rows mutated per tick (an orderbook/streaming shape). Stresses
 *      the row-model-regen path where `getRowId` keeps row identity stable
 *      but cell contents change — the same shape that earlier caught a
 *      stale-data correctness bug in the memo comparator.
 *
 * The orderbook scenario complements hover: hover bails the memo most of
 * the time (only the hovered row changes); orderbook gives the memo a
 * harder workout where many cells legitimately change every tick. If
 * `cells` keeps pace with `off` on orderbook, the comparator overhead is
 * paid for by the bailouts on cells whose values *didn't* change in the
 * batch — and the default flip is robust against the streaming-data case.
 *
 * Run via:
 *   bun run --filter=bench bench:browser
 *
 * Defaults: hover 200 iters / 20 warmup; orderbook 5s / 60Hz / batch 50.
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const PORT = Number(process.env.BENCH_PORT ?? 5181);
const BASE_URL = `http://localhost:${PORT}`;
const HOVER_ITERATIONS = Number(process.env.BENCH_ITERS ?? 200);
const HOVER_WARMUP = Number(process.env.BENCH_WARMUP ?? 20);
const ORDERBOOK_DURATION_MS = Number(process.env.BENCH_ORDERBOOK_MS ?? 5000);
const ORDERBOOK_RATE = Number(process.env.BENCH_ORDERBOOK_HZ ?? 60);
const ORDERBOOK_BATCH = Number(process.env.BENCH_ORDERBOOK_BATCH ?? 50);

const ROWS = [1000, 10_000];
const MODES = /** @type {const} */ (['cells', 'off']);

// 1) Boot the dev server. Pin the port so the page URL is deterministic
// across runs and collisions with a contributor's existing dev server fail
// loud instead of silently driving the wrong app.
console.log(`[bench] starting playground dev server on :${PORT}`);
const dev = spawn(
  'bun',
  ['run', '--filter=playground', 'dev', '--', '--port', String(PORT), '--strictPort'],
  {
    cwd: new URL('../../..', import.meta.url).pathname,
    stdio: ['ignore', 'pipe', 'pipe'],
    // Start a new process group so we can signal the *whole tree* on
    // teardown. Without `detached`, sending SIGTERM to the bun wrapper
    // leaves the vite child orphaned, holding the port — which makes the
    // next `--strictPort` run fail. detached + `kill(-pid)` below sends
    // the signal to every process in the group.
    detached: true,
  },
);
let serverReady = false;
const serverReadyPromise = new Promise((resolve, reject) => {
  const onData = (chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[vite] ${text}`);
    if (text.includes('Local:') || text.includes(`localhost:${PORT}`)) {
      serverReady = true;
      resolve(undefined);
    }
  };
  dev.stdout.on('data', onData);
  dev.stderr.on('data', (chunk) => process.stderr.write(`[vite-err] ${chunk.toString()}`));
  dev.on('exit', (code) => {
    if (!serverReady) reject(new Error(`Vite exited (${code}) before becoming ready`));
  });
  delay(30_000).then(() => {
    if (!serverReady) reject(new Error('Vite did not report ready within 30s'));
  });
});

const attachPageDiagnostics = (page) => {
  page.on('pageerror', (err) => console.error(`[page-error] ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error(`[page-console-error] ${msg.text()}`);
  });
};

/**
 * Run a single hover scenario in the page and return its samples.
 */
const runHoverInPage = (page, iterations, warmup) =>
  page.evaluate(
    async ({ iterations, warmup }) => {
      const win = /** @type {any} */ (window);
      const table = win.__sstBench;
      const rowsModel = table.getRowModel().rows;
      const cycle = Math.min(rowsModel.length, 10);
      for (let i = 0; i < warmup; i++) {
        table.setHoveredRow(rowsModel[i % cycle]);
        await new Promise((r) => requestAnimationFrame(r));
      }
      const durations = [];
      for (let i = 0; i < iterations; i++) {
        const t0 = performance.now();
        table.setHoveredRow(rowsModel[i % cycle]);
        await new Promise((r) => requestAnimationFrame(r));
        durations.push(performance.now() - t0);
      }
      const total = durations.reduce((a, b) => a + b, 0);
      return { durations, total };
    },
    { iterations, warmup },
  );

/**
 * Run a single orderbook scenario in the page. Returns the stats object
 * the harness produces (mean / p50 / p75 / p95 commit ms + rates).
 */
const runOrderbookInPage = (page, durationMs) =>
  page.evaluate(async (durationMs) => {
    const win = /** @type {any} */ (window);
    win.__sstBenchStart();
    // Poll for done with a hard ceiling (durationMs + 2s) to never hang.
    const deadline = performance.now() + durationMs + 2000;
    while (!win.__sstBenchDone) {
      if (performance.now() > deadline) throw new Error('Orderbook bench timed out');
      await new Promise((r) => setTimeout(r, 100));
    }
    return win.__sstBenchStats;
  }, durationMs);

try {
  await serverReadyPromise;
  await delay(500);
  console.log(`[bench] dev server ready at ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  try {
    /** @type {Array<{scenario: 'hover', rows: number, mode: string, durations: number[], total: number}>} */
    const hoverResults = [];
    /** @type {Array<{scenario: 'orderbook', rows: number, mode: string, stats: any}>} */
    const orderbookResults = [];

    for (const rows of ROWS) {
      for (const mode of MODES) {
        // ---- hover ----
        {
          const url = `${BASE_URL}/?bench=true&action=hover&rows=${rows}&memoMode=${mode}`;
          console.log(`[bench] hover ${url}`);
          const page = await browser.newPage();
          attachPageDiagnostics(page);
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForFunction(() => /** @type {any} */ (window).__sstBenchReady === true, {
            timeout: 30_000,
          });
          const data = await runHoverInPage(page, HOVER_ITERATIONS, HOVER_WARMUP);
          hoverResults.push({ scenario: 'hover', rows, mode, ...data });
          await page.close();
        }
        // ---- orderbook ----
        {
          const url = `${BASE_URL}/?bench=true&action=orderbook&rows=${rows}&memoMode=${mode}&rate=${ORDERBOOK_RATE}&batch=${ORDERBOOK_BATCH}&duration=${ORDERBOOK_DURATION_MS}`;
          console.log(`[bench] orderbook ${url}`);
          const page = await browser.newPage();
          attachPageDiagnostics(page);
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForFunction(() => /** @type {any} */ (window).__sstBenchReady === true, {
            timeout: 30_000,
          });
          const stats = await runOrderbookInPage(page, ORDERBOOK_DURATION_MS);
          orderbookResults.push({ scenario: 'orderbook', rows, mode, stats });
          await page.close();
        }
      }
    }

    // ---- report: hover ----
    console.log('\n[bench] hover results:');
    console.log('rows\tmode\titers\tmean(ms)\tp50(ms)\tp75(ms)\tp95(ms)\ttotal(ms)');
    for (const r of hoverResults) {
      const sorted = [...r.durations].sort((a, b) => a - b);
      const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
      const mean = r.total / r.durations.length;
      console.log(
        `${r.rows}\t${r.mode}\t${r.durations.length}\t${mean.toFixed(2)}\t${p(0.5).toFixed(2)}\t${p(0.75).toFixed(2)}\t${p(0.95).toFixed(2)}\t${r.total.toFixed(1)}`,
      );
    }
    console.log('\n[bench] hover cells vs off delta (negative means cells is faster):');
    for (const rows of ROWS) {
      const cells = hoverResults.find((r) => r.rows === rows && r.mode === 'cells');
      const off = hoverResults.find((r) => r.rows === rows && r.mode === 'off');
      if (!cells || !off) continue;
      const cMean = cells.total / cells.durations.length;
      const oMean = off.total / off.durations.length;
      const pct = ((cMean - oMean) / oMean) * 100;
      console.log(
        `  ${rows} rows: cells ${cMean.toFixed(2)}ms vs off ${oMean.toFixed(2)}ms — ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
      );
    }

    // ---- report: orderbook ----
    console.log('\n[bench] orderbook results:');
    console.log(
      'rows\tmode\tcommits\tcommits/s\tupdates/s\tmean(ms)\tp50(ms)\tp75(ms)\tp95(ms)\tmax(ms)',
    );
    for (const r of orderbookResults) {
      const s = r.stats;
      console.log(
        `${r.rows}\t${r.mode}\t${s.commits}\t${s.commitsPerSecond.toFixed(1)}\t${s.updatesPerSecond.toFixed(0)}\t${s.meanCommitMs.toFixed(2)}\t${s.p50CommitMs.toFixed(2)}\t${s.p75CommitMs.toFixed(2)}\t${s.p95CommitMs.toFixed(2)}\t${s.maxCommitMs.toFixed(2)}`,
      );
    }
    console.log(
      '\n[bench] orderbook cells vs off delta (mean commit ms, negative = cells faster):',
    );
    for (const rows of ROWS) {
      const cells = orderbookResults.find((r) => r.rows === rows && r.mode === 'cells');
      const off = orderbookResults.find((r) => r.rows === rows && r.mode === 'off');
      if (!cells || !off) continue;
      const pct =
        ((cells.stats.meanCommitMs - off.stats.meanCommitMs) / off.stats.meanCommitMs) * 100;
      console.log(
        `  ${rows} rows: cells ${cells.stats.meanCommitMs.toFixed(2)}ms vs off ${off.stats.meanCommitMs.toFixed(2)}ms — ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
      );
    }
  } finally {
    await browser.close();
  }
} finally {
  console.log('[bench] stopping dev server');
  try {
    if (dev.pid) process.kill(-dev.pid, 'SIGTERM');
    else dev.kill('SIGTERM');
  } catch {
    // already gone — ignore
  }
  for (let i = 0; i < 20; i++) {
    await delay(100);
    if (dev.exitCode !== null || dev.killed) break;
  }
}
