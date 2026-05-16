import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MaterialReactTable } from '../components/MaterialReactTable';
import { people, personColumns } from './fixtures';

describe('MaterialReactTable — sorting', () => {
  it('toggles sort direction on column header click and reorders rows', async () => {
    const user = userEvent.setup();
    render(<MaterialReactTable columns={personColumns} data={people} />);

    const firstNameHeader = screen.getByRole('columnheader', { name: /first name/i });
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'none');

    // First click → ascending
    await user.click(within(firstNameHeader).getByText('First name'));
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'ascending');

    // After asc sort, the alphabetically first body row should contain "Ada"
    const firstBodyRow = screen.getAllByRole('row')[1];
    expect(within(firstBodyRow).getByText('Ada')).toBeInTheDocument();

    // Second click → descending
    await user.click(within(firstNameHeader).getByText('First name'));
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'descending');

    // After desc sort, the alphabetically last name ("Margaret") should appear first
    const newFirstBodyRow = screen.getAllByRole('row')[1];
    expect(within(newFirstBodyRow).getByText('Margaret')).toBeInTheDocument();
  });
});
