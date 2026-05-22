import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef } from '../types';
import { type Person, people } from './fixtures';

const personColumnsRange: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  {
    accessorKey: 'age',
    header: 'Age',
    filterVariant: 'range',
  },
];

describe('ShadStackTable — range filter', () => {
  // Regression: the range updater used to mutate the previous filter array in
  // place and return the same reference. Successive updates would still
  // eventually settle on the right value, but referential-equality checks could
  // skip re-renders. Forcing a clone-then-update fixes that; this test pins the
  // observable behavior: edits to min and max land independently and the table
  // converges to the intersection.
  it('successive min and max edits converge to the intersected range', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumnsRange}
        data={people}
        initialState={{ showColumnFilters: true }}
      />,
    );

    const minInput = await screen.findByRole('textbox', { name: /^min$/i });
    const maxInput = await screen.findByRole('textbox', { name: /^max$/i });

    // age >= 40
    await user.type(minInput, '40');
    await waitFor(() => {
      expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Grace')).toBeInTheDocument(); // 52
    expect(screen.getByText('Linus')).toBeInTheDocument(); // 41
    expect(screen.getByText('Margaret')).toBeInTheDocument(); // 47

    // age <= 48 (still on top of min)
    await user.type(maxInput, '48');
    await waitFor(() => {
      expect(screen.queryByText('Grace')).not.toBeInTheDocument(); // 52
    });
    expect(screen.getByText('Linus')).toBeInTheDocument();
    expect(screen.getByText('Margaret')).toBeInTheDocument();
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    expect(screen.queryByText('Edsger')).not.toBeInTheDocument(); // 38
  });
});
