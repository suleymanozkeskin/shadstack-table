import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — global filter', () => {
  it('narrows visible rows to global search matches across columns', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableGlobalFilter
        initialState={{ showGlobalFilter: true }}
      />,
    );

    const searchInput = await screen.findByPlaceholderText(/search/i);

    // "Hopper" appears only in Grace's row
    await user.type(searchInput, 'Hopper');

    await waitFor(() => {
      expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getByText('Hopper')).toBeInTheDocument();
    expect(screen.queryByText('Linus')).not.toBeInTheDocument();
    expect(screen.queryByText('Margaret')).not.toBeInTheDocument();
  });

  // Regression: ranked fuzzy search used to mutate
  // getPrePaginationRowModel().rows in place via Array.prototype.sort. Other
  // consumers reading the same model could observe the reordered (or stale)
  // sequence. Cloning before sort fixes that; this test pins the observable
  // outcome — natural data order returns once the search clears.
  it('returns to natural row order after a ranked search is cleared', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableGlobalFilter
        initialState={{ showGlobalFilter: true }}
      />,
    );

    const searchInput = await screen.findByPlaceholderText(/search/i);

    // Search that triggers fuzzy ranking and reorders rows
    await user.type(searchInput, 'Hopper');
    await waitFor(() => {
      expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    });

    // Clear the search
    await user.clear(searchInput);

    // All rows visible again, in the original data order
    await waitFor(() => {
      expect(screen.getByText('Ada')).toBeInTheDocument();
    });

    const cells = screen.getAllByRole('cell');
    const firstNamesInOrder = cells
      .map((c) => c.textContent ?? '')
      .filter((text) => ['Ada', 'Grace', 'Linus', 'Margaret', 'Edsger'].includes(text));
    expect(firstNamesInOrder).toEqual(['Ada', 'Grace', 'Linus', 'Margaret', 'Edsger']);
  });
});
