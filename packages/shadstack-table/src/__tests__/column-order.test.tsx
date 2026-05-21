import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef } from '../types';
import { type Person, people } from './fixtures';

const firstNameAndLastName: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
];

const firstNameAndAge: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'age', header: 'Age' },
];

// Regression: column-order rebuild used to watch only the total column count.
// Swapping one column for another with the same length left the previous
// column id in columnOrder, so the new column wouldn't render. Now the rebuild
// effect compares a stable id signature, so an id change with equal length
// still triggers a rebuild.
describe('ShadStackTable — column order tracks id changes, not just count', () => {
  it('replacing one column with another (same length, different id) rebuilds the order', async () => {
    const { rerender } = render(<ShadStackTable columns={firstNameAndLastName} data={people} />);

    await waitFor(() => {
      expect(screen.getByText('Last name')).toBeInTheDocument();
    });
    expect(screen.queryByText('Age')).not.toBeInTheDocument();

    rerender(<ShadStackTable columns={firstNameAndAge} data={people} />);

    await waitFor(() => {
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
    expect(screen.queryByText('Last name')).not.toBeInTheDocument();
  });
});
