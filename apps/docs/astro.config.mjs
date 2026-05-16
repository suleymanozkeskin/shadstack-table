import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// Site URL is read from STARLIGHT_SITE so the same config works for
// GitHub Pages, Cloudflare Pages, or anywhere else without a code change.
const site = process.env.STARLIGHT_SITE || 'https://example.com';
const base = process.env.STARLIGHT_BASE || undefined;

export default defineConfig({
  site,
  base,
  integrations: [
    react(),
    starlight({
      title: 'shadstack-table',
      description: 'shadcn-native React data table with material-react-table feature parity.',
      // Inject our Tailwind v4 stylesheet so library tokens + utility classes
      // are available everywhere — including inside MDX <ShadStackTable/> islands.
      customCss: ['./src/styles/global.css'],
      social: [
        // GitHub URL: drop in when the repo goes public. Starlight 0.38
        // accepts an array of social entries; empty array hides the icon row.
      ],
      sidebar: [
        { label: 'Overview', slug: 'index' },
        { label: 'Getting started', slug: 'getting-started' },
        { label: 'Live demo', slug: 'example' },
      ],
    }),
  ],
  vite: {
    resolve: {
      alias: {
        // Point at source so docs always reflect the working tree, not the
        // last built dist/. Mirrors apps/playground/vite.config.ts.
        'shadstack-table': fileURLToPath(
          new URL('../../packages/shadstack-table/src/index.ts', import.meta.url),
        ),
        '@playground': fileURLToPath(new URL('../../apps/playground/src', import.meta.url)),
      },
    },
  },
});
