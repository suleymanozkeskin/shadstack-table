import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// Regression: Memo_SST_TableBody used to skip re-renders whenever
// `data` was reference-stable, so feature state changes (filters, selection,
// pagination) could be silently dropped. The comparator was tightened to skip
// only during active column resize; these tests pin that visible state
// changes still flow through under the user-facing memo modes.
describe('ShadStackTable — memo modes still propagate state updates', () => {
  it('rows memo mode: column filter still narrows visible rows', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        memoMode="rows"
        initialState={{ showColumnFilters: true }}
      />,
    );

    const filterInput = await screen.findByRole('textbox', { name: /filter by first name/i });
    await user.type(filterInput, 'Ada');

    await waitFor(() => {
      expect(screen.queryByText('Grace')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('cells memo mode: column filter still narrows visible rows', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        memoMode="cells"
        initialState={{ showColumnFilters: true }}
      />,
    );

    const filterInput = await screen.findByRole('textbox', { name: /filter by first name/i });
    await user.type(filterInput, 'Linus');

    await waitFor(() => {
      expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Linus')).toBeInTheDocument();
  });
});
