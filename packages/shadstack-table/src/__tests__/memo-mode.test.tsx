import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type Person, people, personColumns } from './fixtures';

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

  it('rows memo mode: stable-id data replacement updates the visible row', async () => {
    const initial: Person = { id: 'p001', firstName: 'Old', lastName: 'Value', age: 30 };
    const next: Person = { id: 'p001', firstName: 'New', lastName: 'Value', age: 30 };

    function Harness() {
      const [data, setData] = useState<Person[]>([initial]);
      return (
        <>
          <button type="button" onClick={() => setData([next])}>
            replace
          </button>
          <ShadStackTable
            columns={personColumns}
            data={data}
            getRowId={(row) => row.id}
            memoMode="rows"
          />
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByText('Old')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /replace/i }));

    await waitFor(() => {
      expect(screen.queryByText('Old')).not.toBeInTheDocument();
    });
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  // Regression: the perf refactor that moved cell-state to props originally
  // switched the cell memo from `prev.cell === next.cell` to `cell.id` to
  // sidestep TanStack regenerating cell instances on irrelevant state
  // changes. That left the memo bailing on immutable data replacement when
  // `getRowId` kept ids stable — i.e. the orderbook/streaming-data use case
  // could render stale values. The comparator is back to reference equality
  // (with column-ref stability upstream keeping refs warm across narrow
  // state changes), so a data-replacement cycle must surface the new value.
  it('cells memo mode: stable-id data replacement updates the visible cell', async () => {
    const initial: Person = { id: 'p001', firstName: 'Old', lastName: 'Value', age: 30 };
    const next: Person = { id: 'p001', firstName: 'New', lastName: 'Value', age: 30 };

    function Harness() {
      const [data, setData] = useState<Person[]>([initial]);
      return (
        <>
          <button type="button" onClick={() => setData([next])}>
            replace
          </button>
          <ShadStackTable
            columns={personColumns}
            data={data}
            getRowId={(row) => row.id}
            memoMode="cells"
          />
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByText('Old')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /replace/i }));

    await waitFor(() => {
      expect(screen.queryByText('Old')).not.toBeInTheDocument();
    });
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
