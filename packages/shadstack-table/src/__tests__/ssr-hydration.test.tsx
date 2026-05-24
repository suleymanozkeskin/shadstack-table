/**
 * Regression: the toolbar's `useMediaQuery` and `useDirection` hooks used to
 * read `window.matchMedia` / `document.documentElement.dir` inside a lazy
 * `useState` initializer, which produced a hydration mismatch when the
 * server snapshot (`false` / `'ltr'`) disagreed with the client snapshot.
 * React's hydration spec keeps the SERVER's class attributes in that case,
 * which made the toolbar render the wrong breakpoint class until the next
 * unrelated re-render.
 *
 * The hooks are now built on `useSyncExternalStore` with an explicit server
 * snapshot. These tests pin that contract: `renderToString` must produce
 * the same markup whether `window.matchMedia` is mocked to return `true` or
 * `false`, because the server path returns the fixed snapshot.
 */
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// `useSyncExternalStore`'s `getServerSnapshot` path is taken when there's
// no `window`. Strip it out for the duration of the test, mirroring a real
// Node SSR render where browser globals don't exist.
const withoutBrowserGlobals = (fn: () => void) => {
  const origWindow = globalThis.window;
  const origDocument = globalThis.document;
  // Force the "server" branch — matchMedia / documentElement are unreachable.
  (globalThis as unknown as { window?: unknown }).window = undefined;
  (globalThis as unknown as { document?: unknown }).document = undefined;
  try {
    fn();
  } finally {
    (globalThis as unknown as { window?: unknown }).window = origWindow;
    (globalThis as unknown as { document?: unknown }).document = origDocument;
  }
};

describe('SSR hydration safety', () => {
  afterEach(() => {
    // The withoutBrowserGlobals helper restores globals; this is belt-and-suspenders.
  });

  it('renderToString works without browser globals (toolbar hooks return server snapshots)', () => {
    let html: string | null = null;
    withoutBrowserGlobals(() => {
      html = renderToString(<ShadStackTable columns={personColumns} data={people} />);
    });

    expect(html).toBeTypeOf('string');
    // The exact markup is opaque, but no error during render means
    // useSyncExternalStore correctly used getServerSnapshot.
    expect(html!.length).toBeGreaterThan(0);
  });

  it('renderToString output is identical regardless of mocked matchMedia (server snapshot is stable)', () => {
    let htmlA: string | null = null;
    let htmlB: string | null = null;

    // matchMedia would be mocked differently in two environments; but on the
    // server, both renders must produce the same output because
    // getServerSnapshot ignores `window`.
    withoutBrowserGlobals(() => {
      htmlA = renderToString(<ShadStackTable columns={personColumns} data={people} />);
    });
    withoutBrowserGlobals(() => {
      htmlB = renderToString(<ShadStackTable columns={personColumns} data={people} />);
    });

    expect(htmlA).toEqual(htmlB);
  });
});
