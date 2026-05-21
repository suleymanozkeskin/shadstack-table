import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef, type SST_SortingState } from '../types';
import { type Person, people } from './fixtures';

const columns: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
];

function Harness({ initialSorting }: { initialSorting: SST_SortingState }) {
  const [sorting, setSorting] = useState<SST_SortingState>(initialSorting);
  const [globalFilter, setGlobalFilter] = useState('');

  return (
    <>
      <button
        type="button"
        data-testid="clear-sort"
        onClick={() => {
          setSorting([]);
        }}
      >
        Clear sort
      </button>
      <button
        type="button"
        data-testid="set-filter"
        onClick={() => {
          setGlobalFilter('Ada');
        }}
      >
        Set filter
      </button>
      <button
        type="button"
        data-testid="clear-filter"
        onClick={() => {
          setGlobalFilter('');
        }}
      >
        Clear filter
      </button>
      <div data-testid="sort-state">{JSON.stringify(sorting)}</div>
      <ShadStackTable
        columns={columns}
        data={people}
        enableGlobalFilter
        enableGlobalFilterRankedResults
        state={{ globalFilter, sorting }}
        onGlobalFilterChange={setGlobalFilter}
        onSortingChange={(updater) => {
          setSorting((prev) => (typeof updater === 'function' ? updater(prev) : updater));
        }}
      />
    </>
  );
}

describe('ShadStackTable — sort restoration after ranked global filter', () => {
  // Regression: appliedSort.current only captured non-empty sort states, so
  // an intentionally cleared sort got forgotten. When the user then applied
  // and cleared a ranked global search, the stale old sort was restored.
  // The fix snapshots sort at the transition into ranked-filter mode and
  // restores exactly that snapshot — including an empty array.
  it('keeps the user-cleared sort empty after applying and clearing a ranked search', async () => {
    const user = userEvent.setup();
    render(<Harness initialSorting={[{ id: 'firstName', desc: false }]} />);

    expect(screen.getByTestId('sort-state').textContent).toBe(
      JSON.stringify([{ id: 'firstName', desc: false }]),
    );

    // user clears their sort intentionally
    await user.click(screen.getByTestId('clear-sort'));
    await waitFor(() => {
      expect(screen.getByTestId('sort-state').textContent).toBe('[]');
    });

    // user runs a ranked search, then clears it
    await user.click(screen.getByTestId('set-filter'));
    await user.click(screen.getByTestId('clear-filter'));

    await waitFor(() => {
      expect(screen.getByTestId('sort-state').textContent).toBe('[]');
    });
  });

  it('restores a prior sort exactly when ranked search is applied then cleared', async () => {
    const user = userEvent.setup();
    render(<Harness initialSorting={[{ id: 'firstName', desc: true }]} />);

    expect(screen.getByTestId('sort-state').textContent).toBe(
      JSON.stringify([{ id: 'firstName', desc: true }]),
    );

    await user.click(screen.getByTestId('set-filter'));

    // While the search is active, ranked-mode clears the sort
    await waitFor(() => {
      expect(screen.getByTestId('sort-state').textContent).toBe('[]');
    });

    // Clearing the search should restore the original sort
    await user.click(screen.getByTestId('clear-filter'));

    await waitFor(() => {
      expect(screen.getByTestId('sort-state').textContent).toBe(
        JSON.stringify([{ id: 'firstName', desc: true }]),
      );
    });
  });
});
