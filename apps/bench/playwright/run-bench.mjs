/**
 * Real-browser bench for memoMode='cells' vs memoMode='off'.
 *
 * The Vitest+happy-dom benches showed the wall-clock A/B between the two
 * modes is a wash — cell-render bodies are cheap when there's no real
 * layout/paint, so the memo's savings have nothing to amortise against.
 * This script runs the same shape against real Chromium so the memo cost
 * (comparator overhead) and benefit (skipped real-DOM updates) both bear
 * actual costs.
 *
 * Structure:
 *   - Start playground dev server on port 5181
 *   - For each (rows, memoMode) pair:
 *     - Launch a fresh Chromium page at /?bench=true&rows=N&memoMode=M
 *     - Wait for `window.__sstBenchReady === true`
 *     - In page context: run a loop of `table.setHoveredRow(...)`,
 *       cycling through visible rows, timing the whole loop via
 *       performance.now()
 *   - Print a comparison table
 *
 * Run once via:
 *   bun run apps/bench/playwright/run-bench.mjs
 *
 * Defaults: 200 iterations per case, 5 warmup, 1k & 10k rows.
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const PORT = Number(process.env.BENCH_PORT ?? 5181);
const BASE_URL = `http://localhost:${PORT}`;
const ITERATIONS = Number(process.env.BENCH_ITERS ?? 200);
const WARMUP = Number(process.env.BENCH_WARMUP ?? 20);

const ROWS = [1000, 10_000];
const MODES = /** @type {const} */ (['cells', 'off']);

// 1) Boot the dev server. We pin the port so the page URL is deterministic
// across runs and so collisions with a contributor's existing dev server
// fail loud instead of silently driving the wrong app.
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
    // *next* `--strictPort` run fail. detached + `kill(-pid)` below sends
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
  // Hard timeout — never want a CI run to hang on a wedged Vite.
  delay(30_000).then(() => {
    if (!serverReady) reject(new Error('Vite did not report ready within 30s'));
  });
});

try {
  await serverReadyPromise;
  // Vite reports "Local: ..." sometimes before the server actually accepts
  // connections. Give it a beat.
  await delay(500);
  console.log(`[bench] dev server ready at ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  try {
    /** @type {Array<{rows: number, mode: string, durations: number[], total: number}>} */
    const results = [];
    for (const rows of ROWS) {
      for (const mode of MODES) {
        const url = `${BASE_URL}/?bench=true&rows=${rows}&memoMode=${mode}`;
        console.log(`[bench] running ${url}`);
        const page = await browser.newPage();
        // Capture page console errors so a runtime exception in the bench
        // page surfaces in the script output instead of being silently
        // swallowed by Playwright.
        page.on('pageerror', (err) => {
          console.error(`[page-error] ${err.message}`);
        });
        page.on('console', (msg) => {
          if (msg.type() === 'error') console.error(`[page-console-error] ${msg.text()}`);
        });

        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => /** @type {any} */ (window).__sstBenchReady === true, {
          timeout: 30_000,
        });

        // Drive the bench fully inside the page so we measure with the
        // browser's own clock and avoid IPC latency between Playwright and
        // the renderer.
        const data = await page.evaluate(
          async ({ iterations, warmup }) => {
            const win = /** @type {any} */ (window);
            const table = win.__sstBench;
            const rowsModel = table.getRowModel().rows;
            // Cycle through the first 10 rows so each setHoveredRow flips
            // state (setting to the same row would no-op).
            const cycle = Math.min(rowsModel.length, 10);

            // Warmup — pay JIT cost, allocate scratch buffers, etc.
            for (let i = 0; i < warmup; i++) {
              table.setHoveredRow(rowsModel[i % cycle]);
              // microtask gap so React commits before the next set
              await new Promise((r) => requestAnimationFrame(r));
            }

            const durations = [];
            for (let i = 0; i < iterations; i++) {
              const t0 = performance.now();
              table.setHoveredRow(rowsModel[i % cycle]);
              // requestAnimationFrame waits for the browser to commit + paint
              await new Promise((r) => requestAnimationFrame(r));
              durations.push(performance.now() - t0);
            }

            const total = durations.reduce((a, b) => a + b, 0);
            return { durations, total };
          },
          { iterations: ITERATIONS, warmup: WARMUP },
        );

        results.push({ rows, mode, ...data });
        await page.close();
      }
    }

    // Report
    console.log('\n[bench] results:');
    console.log('rows\tmode\titers\tmean(ms)\tp50(ms)\tp75(ms)\tp95(ms)\ttotal(ms)');
    for (const r of results) {
      const sorted = [...r.durations].sort((a, b) => a - b);
      const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
      const mean = r.total / r.durations.length;
      console.log(
        `${r.rows}\t${r.mode}\t${r.durations.length}\t${mean.toFixed(2)}\t${p(0.5).toFixed(2)}\t${p(0.75).toFixed(2)}\t${p(0.95).toFixed(2)}\t${r.total.toFixed(1)}`,
      );
    }

    // Pairwise delta: cells vs off at the same row count.
    console.log('\n[bench] cells vs off delta (negative means cells is faster):');
    for (const rows of ROWS) {
      const cells = results.find((r) => r.rows === rows && r.mode === 'cells');
      const off = results.find((r) => r.rows === rows && r.mode === 'off');
      if (!cells || !off) continue;
      const cellsMean = cells.total / cells.durations.length;
      const offMean = off.total / off.durations.length;
      const pct = ((cellsMean - offMean) / offMean) * 100;
      console.log(
        `  ${rows} rows: cells ${cellsMean.toFixed(2)}ms vs off ${offMean.toFixed(2)}ms — ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
      );
    }
  } finally {
    await browser.close();
  }
} finally {
  console.log('[bench] stopping dev server');
  // Signal the whole process group (created via `detached: true`). The
  // negative pid is the POSIX convention for "send this signal to every
  // process whose PGID == this number". Falls back to dev.kill() if pid
  // is missing (process never started).
  try {
    if (dev.pid) process.kill(-dev.pid, 'SIGTERM');
    else dev.kill('SIGTERM');
  } catch {
    // already gone — ignore
  }
  // Wait up to 2s for the port to clear before exit. Without this the
  // *next* run can race the kernel's TIME_WAIT and fail --strictPort.
  for (let i = 0; i < 20; i++) {
    await delay(100);
    if (dev.exitCode !== null || dev.killed) break;
  }
}
