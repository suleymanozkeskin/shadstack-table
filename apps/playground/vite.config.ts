import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'shadstack-table': resolve(__dirname, '../../packages/shadstack-table/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
