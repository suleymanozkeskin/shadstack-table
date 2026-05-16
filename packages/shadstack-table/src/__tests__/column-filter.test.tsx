import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — column filter', () => {
  it('filters rows down to substring matches in the typed column', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        initialState={{ showColumnFilters: true }}
      />,
    );

    const filterInput = await screen.findByRole('textbox', { name: /filter by first name/i });

    await user.type(filterInput, 'Ada');

    // Filter is 200ms-debounced. Wait for the non-matching rows to drop out.
    await waitFor(() => {
      expect(screen.queryByText('Grace')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.queryByText('Linus')).not.toBeInTheDocument();
    expect(screen.queryByText('Margaret')).not.toBeInTheDocument();
  });
});
