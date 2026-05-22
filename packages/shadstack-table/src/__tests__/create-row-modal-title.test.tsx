import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// The create flow is triggered via `table.setCreatingRow(true)` since the
// library does not ship a built-in "Create" toolbar button — we mirror the
// idiomatic consumer pattern (upstream MRT docs show the same) by exposing the
// trigger through `renderTopToolbarCustomActions`. This keeps the test driving
// the same code path real consumers do: button click -> setCreatingRow(true)
// -> creatingRow state populated -> modal renders with the create title.
describe('ShadStackTable — create vs edit row modal title', () => {
  it('renders the Edit title when the edit modal opens', async () => {
    const user = userEvent.setup();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        editDisplayMode="modal"
        getRowId={(row) => row.id}
      />,
    );

    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    await user.click(editButtons[0]);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders the Create title when the create modal opens', async () => {
    const user = userEvent.setup();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        createDisplayMode="modal"
        getRowId={(row) => row.id}
        renderTopToolbarCustomActions={({ table }) => (
          <button type="button" onClick={() => table.setCreatingRow(true)}>
            New person
          </button>
        )}
      />,
    );

    await user.click(screen.getByRole('button', { name: /new person/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Create' })).toBeInTheDocument();
  });

  it('respects the localization.create override on the create modal title', async () => {
    const user = userEvent.setup();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        createDisplayMode="modal"
        getRowId={(row) => row.id}
        localization={{ create: 'Add' }}
        renderTopToolbarCustomActions={({ table }) => (
          <button type="button" onClick={() => table.setCreatingRow(true)}>
            New person
          </button>
        )}
      />,
    );

    await user.click(screen.getByRole('button', { name: /new person/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Add' })).toBeInTheDocument();
  });
});
