import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const localeEntries = Object.fromEntries(
  readdirSync(resolve(__dirname, 'src/locales'))
    .filter((f) => f.endsWith('.ts'))
    .map((f) => {
      const name = f.replace(/\.ts$/, '');
      return [`locales/${name}`, resolve(__dirname, `src/locales/${f}`)];
    }),
);

const external = [
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
  /^date-fns(\/|$)/,
  'react-day-picker',
];

// `_ui/styles.css` is hand-authored library CSS only — no `@import "tailwindcss"`
// and no `@source` scanning, so the Tailwind Vite plugin is intentionally NOT
// loaded here. Including it would re-bundle the full Tailwind preflight, theme,
// and utilities into `dist/style.css` and collide with the consumer's own
// Tailwind cascade (see 0.2.0 changelog). Consumers' Tailwind builds generate
// utilities for shadstack-table by adding `@source` to their own globals.
export default defineConfig(({ mode }) => {
  const isLocales = mode === 'locales';

  return {
    plugins: [
      react(),
      dts({
        exclude: ['src/__tests__/**', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
        include: isLocales ? ['src/locales'] : ['src'],
        rollupTypes: !isLocales,
        tsconfigPath: './tsconfig.json',
      }),
    ],
    build: {
      emptyOutDir: !isLocales,
      lib: {
        entry: isLocales ? localeEntries : resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: isLocales
          ? (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`
          : (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        cssFileName: isLocales ? undefined : 'style',
      },
      rollupOptions: {
        external,
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
  };
});
