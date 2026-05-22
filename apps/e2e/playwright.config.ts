import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke-only Playwright config — chromium only, drives the playground Vite
 * dev server. Cross-browser matrix and visual regression are intentionally
 * out of scope for this PR; see PR description for rationale.
 *
 * We bind to port 5180 (not Vite's default 5173) to avoid colliding with
 * an unrelated dev server a contributor might already have running. The
 * port is forced via `--port` + `--strictPort`, so a collision fails loud
 * instead of silently driving a stranger app on 5173.
 */
const PORT = Number(process.env.E2E_PORT ?? 5180);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Run from the monorepo root so the workspace filter resolves. Playwright
    // sets cwd to the config's directory by default, hence the relative path.
    // --strictPort makes Vite fail rather than silently picking the next free
    // port, which would leave Playwright pointed at nothing.
    command: `bun run --filter=playground dev -- --port ${PORT} --strictPort`,
    cwd: '../..',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
