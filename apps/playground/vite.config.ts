import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'shadstack-table': resolve(__dirname, '../../packages/shadstack-table/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
