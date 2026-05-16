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
});
