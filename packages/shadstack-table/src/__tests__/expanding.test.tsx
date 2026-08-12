import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — detail panel expand', () => {
  it('reveals renderDetailPanel content when the row expand button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
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

  it('disables the expand button on rows whose renderDetailPanel returns nothing', () => {
    // `renderDetailPanel` may opt a row out by returning null. Such a row has no
    // panel to reveal, so its expand button must stay disabled — an enabled
    // no-op button would still write the row into `expanded`, and any expanded
    // row switches off ranked global filtering for the whole table.
    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        renderDetailPanel={({ row }) =>
          row.original.id === 'p001' ? (
            <div data-testid={`detail-${row.original.id}`}>Detail for {row.original.firstName}</div>
          ) : null
        }
      />,
    );

    const expandButtons = screen.getAllByRole('button', { name: /^expand$/i });
    expect(expandButtons).toHaveLength(2);
    expect(expandButtons[0]).toBeEnabled();
    expect(expandButtons[1]).toBeDisabled();
  });
});
