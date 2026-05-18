import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// `_ui/styles.css` is hand-authored library CSS only — no `@import "tailwindcss"`
// and no `@source` scanning, so the Tailwind Vite plugin is intentionally NOT
// loaded here. Including it would re-bundle the full Tailwind preflight, theme,
// and utilities into `dist/style.css` and collide with the consumer's own
// Tailwind cascade (see 0.2.0 changelog). Consumers' Tailwind builds generate
// utilities for shadstack-table by adding `@source` to their own globals.
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tanstack/react-table',
        '@tanstack/react-virtual',
        '@tanstack/match-sorter-utils',
        /^@radix-ui\//,
        'lucide-react',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    target: 'es2022',
    minify: false,
  },
});
