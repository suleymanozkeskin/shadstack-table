import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MaterialReactTable } from '../components/MaterialReactTable';
import { people, personColumnsWithAge } from './fixtures';

describe('MaterialReactTable — column visibility', () => {
  it('hides a column when its switch is toggled off via the show/hide menu', async () => {
    const user = userEvent.setup();
    render(<MaterialReactTable columns={personColumnsWithAge} data={people} />);

    // Sanity: all three column headers present.
    expect(screen.getByRole('columnheader', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /age/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show\/hide columns/i }));

    // Switches are labeled by the column header text. Pick the "Age" toggle.
    const ageLabel = await screen.findByText('Age', { selector: 'label span, span' });
    const ageSwitch = within(ageLabel.closest('label') as HTMLElement).getByRole('switch');

    await user.click(ageSwitch);

    await waitFor(() => {
      expect(screen.queryByRole('columnheader', { name: /age/i })).not.toBeInTheDocument();
    });

    expect(screen.getByRole('columnheader', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /last name/i })).toBeInTheDocument();
  });
});
