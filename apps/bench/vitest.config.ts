import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Bench env mirrors the package's unit-test env (happy-dom) so component
// timings reflect the same DOM implementation reviewers see in `bun run test`.
// Source is consumed straight from the workspace via the same alias the
// playground app uses — no `vite build` step between benchmark runs.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'shadstack-table': resolve(__dirname, '../../packages/shadstack-table/src/index.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./bench-setup.ts'],
    css: false,
    include: ['src/**/*.bench.{ts,tsx}'],
    benchmark: {
      include: ['src/**/*.bench.{ts,tsx}'],
      reporters: ['default'],
    },
  },
});
