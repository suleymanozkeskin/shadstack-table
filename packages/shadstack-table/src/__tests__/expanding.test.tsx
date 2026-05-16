import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MaterialReactTable } from '../components/MaterialReactTable';
import { people, personColumns } from './fixtures';

describe('MaterialReactTable — detail panel expand', () => {
  it('reveals renderDetailPanel content when the row expand button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MaterialReactTable
        columns={personColumns}
        data={people.slice(0, 2)}
        renderDetailPanel={({ row }) => (
          <div data-testid={`detail-${row.original.id}`}>Detail for {row.original.firstName}</div>
        )}
      />,
    );

    // Radix Collapsible only mounts content when open, so the detail panel
    // testids should not be in the DOM yet.
    expect(screen.queryByTestId('detail-p001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('detail-p002')).not.toBeInTheDocument();

    const expandButtons = screen.getAllByRole('button', { name: /^expand$/i });
    expect(expandButtons.length).toBeGreaterThanOrEqual(2);

    await user.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('detail-p001')).toHaveTextContent('Detail for Ada');
    });
    expect(screen.queryByTestId('detail-p002')).not.toBeInTheDocument();
  });
});
