import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// PR #50 fixed a leak: when the table unmounted while in full-screen, the
// useEffect in useSST_Effects had no cleanup, so `document.body.style.height
// = '100dvh'` stayed on the host page. The fix moved the height mutation
// into the effect body and the restoration into the returned cleanup, which
// runs on both `isFullScreen → false` and on unmount.
//
// Happy-dom's CSS parser silently rejects `dvh` units (it accepts `vh`/`px`
// but not `dvh`), so we can't read the assignment back via
// `document.body.style.height`. Instead we spy on the style setter — that
// captures every write the production code makes, regardless of whether
// happy-dom's underlying value retention works. The PR's actual fix is a
// `return () => { document.body.style.height = '...' }` cleanup, so we
// only need to assert the cleanup-time write actually fires.

const installHeightWriteSpy = () => {
  const writes: string[] = [];
  const proto = Object.getPrototypeOf(document.body.style);
  const original = Object.getOwnPropertyDescriptor(proto, 'height');
  Object.defineProperty(document.body.style, 'height', {
    configurable: true,
    get: original?.get ?? (() => ''),
    set(value: string) {
      writes.push(value);
      original?.set?.call(this, value);
    },
  });
  const restore = () => {
    if (original) {
      // Restore the prototype descriptor by deleting the instance override.
      delete (document.body.style as unknown as Record<string, unknown>).height;
    }
  };
  return { writes, restore };
};

describe('full-screen lifecycle — body height cleanup', () => {
  let spy: ReturnType<typeof installHeightWriteSpy>;

  beforeEach(() => {
    spy = installHeightWriteSpy();
  });

  afterEach(() => {
    spy.restore();
  });

  it('restores body height when toggling out of full-screen', async () => {
    const user = userEvent.setup();
    render(<ShadStackTable columns={personColumns} data={people} />);

    const toggle = screen.getByRole('button', { name: /toggle full screen/i });

    await user.click(toggle);
    // Entering FS: effect body sets '100dvh'
    expect(spy.writes).toContain('100dvh');

    spy.writes.length = 0;

    await user.click(toggle);
    // Exiting FS: cleanup writes back the captured initial body height
    // (empty string in jsdom/happy-dom by default).
    expect(spy.writes).toContain('');
  });

  it('restores body height when the table unmounts while still in full-screen', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ShadStackTable columns={personColumns} data={people} />);

    await user.click(screen.getByRole('button', { name: /toggle full screen/i }));
    expect(spy.writes).toContain('100dvh');

    spy.writes.length = 0;
    unmount();

    // The unmount-while-FS cleanup is exactly what PR #50 added. Without it
    // the host page is stuck at 100dvh after the table component is gone.
    expect(spy.writes).toContain('');
  });

  it('does not touch body height when full-screen is never entered', () => {
    const { unmount } = render(<ShadStackTable columns={personColumns} data={people} />);
    expect(spy.writes).toHaveLength(0);
    unmount();
    expect(spy.writes).toHaveLength(0);
  });
});
