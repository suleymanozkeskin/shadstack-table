import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef } from '../types';
import { type Person, people } from './fixtures';

const personColumnsMultiSelect: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  {
    accessorKey: 'lastName',
    header: 'Last name',
    filterVariant: 'multi-select',
    filterSelectOptions: ['Lovelace', 'Hopper', 'Torvalds', 'Hamilton', 'Dijkstra'],
  },
];

describe('ShadStackTable — multi-select filter', () => {
  it('selecting two values keeps both matching rows visible', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumnsMultiSelect}
        data={people}
        initialState={{ showColumnFilters: true }}
      />,
    );

    const trigger = await screen.findByRole('button', { name: /filter by last name/i });
    await user.click(trigger);

    await user.click(await screen.findByRole('checkbox', { name: 'Lovelace' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Hopper' }));

    await waitFor(() => {
      expect(screen.queryByText('Linus')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.queryByText('Margaret')).not.toBeInTheDocument();
    expect(screen.queryByText('Edsger')).not.toBeInTheDocument();
  });

  it('unchecking a value removes it from the filter array', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumnsMultiSelect}
        data={people}
        initialState={{ showColumnFilters: true }}
      />,
    );

    const trigger = await screen.findByRole('button', { name: /filter by last name/i });
    await user.click(trigger);

    await user.click(await screen.findByRole('checkbox', { name: 'Lovelace' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Hopper' }));

    await waitFor(() => {
      expect(screen.queryByText('Linus')).not.toBeInTheDocument();
    });

    // Uncheck Lovelace — Ada should disappear, Grace should remain.
    await user.click(screen.getByRole('checkbox', { name: 'Lovelace' }));

    await waitFor(() => {
      expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Grace')).toBeInTheDocument();
  });

  it('clear button empties the selection and shows all rows', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumnsMultiSelect}
        data={people}
        initialState={{ showColumnFilters: true }}
      />,
    );

    const trigger = await screen.findByRole('button', { name: /filter by last name/i });
    await user.click(trigger);

    await user.click(await screen.findByRole('checkbox', { name: 'Lovelace' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Hopper' }));

    await waitFor(() => {
      expect(screen.queryByText('Linus')).not.toBeInTheDocument();
    });

    // Close the popover so the clear button (sibling to the trigger) is reachable.
    await user.keyboard('{Escape}');

    // Each filterable column renders its own "Clear filter" button; only the
    // one for the multi-select column is enabled because it has a value.
    const clearButtons = screen.getAllByRole('button', { name: /clear filter/i });
    const enabledClear = clearButtons.find((b) => !(b as HTMLButtonElement).disabled);
    expect(enabledClear).toBeDefined();
    await user.click(enabledClear!);

    await waitFor(() => {
      expect(screen.getByText('Linus')).toBeInTheDocument();
    });
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getByText('Margaret')).toBeInTheDocument();
    expect(screen.getByText('Edsger')).toBeInTheDocument();
  });
});
