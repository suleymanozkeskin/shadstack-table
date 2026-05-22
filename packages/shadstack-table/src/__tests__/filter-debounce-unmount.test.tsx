import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// PR #50 hoisted `debounce` into a shared util with a `.cancel()` method and
// wired both filter inputs (column + global) to cancel pending timers on
// unmount. Without it, a trailing invocation could fire after the component
// is gone and call `column.setFilterValue` / `setGlobalFilter` against a
// table that no longer exists.
//
// We use real timers and a generous post-unmount wait (longer than the
// 200ms text-filter / 250ms global-filter debounce window). If cancel()
// works the post-unmount mock-call count matches the pre-unmount snapshot;
// if it regresses, the trailing debounced invocation surfaces as one
// additional `on*Change` call after the unmount.

const DEBOUNCE_GRACE_MS = 500;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

describe('filter inputs — debounce cancel on unmount', () => {
  it('cancels pending column-filter debounce when the input unmounts', async () => {
    const onColumnFiltersChange = vi.fn();
    const user = userEvent.setup();

    const { unmount } = render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        initialState={{ showColumnFilters: true }}
        onColumnFiltersChange={onColumnFiltersChange}
      />,
    );

    const filterInput = await screen.findByRole('textbox', { name: /filter by first name/i });
    await user.type(filterInput, 'A');

    // Snapshot the callback count before unmount. TanStack may invoke
    // onColumnFiltersChange during initial mount; we only care about
    // post-debounce calls, so compare against the baseline.
    const beforeUnmount = onColumnFiltersChange.mock.calls.length;

    unmount();
    await wait(DEBOUNCE_GRACE_MS);

    expect(onColumnFiltersChange.mock.calls.length).toBe(beforeUnmount);
  });

  it('cancels pending global-filter debounce when the toolbar unmounts', async () => {
    const onGlobalFilterChange = vi.fn();
    const user = userEvent.setup();

    const { unmount } = render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        onGlobalFilterChange={onGlobalFilterChange}
      />,
    );

    // The global search input may be collapsed by default — open it via the
    // search-toggle button if needed, otherwise read directly.
    let searchInput = screen.queryByPlaceholderText(/search/i);
    if (!searchInput) {
      const searchToggle = screen.getByRole('button', { name: /show.*search|search/i });
      await user.click(searchToggle);
      searchInput = await screen.findByPlaceholderText(/search/i);
    }
    await user.type(searchInput, 'a');

    const beforeUnmount = onGlobalFilterChange.mock.calls.length;

    unmount();
    await wait(DEBOUNCE_GRACE_MS);

    expect(onGlobalFilterChange.mock.calls.length).toBe(beforeUnmount);
  });
});
