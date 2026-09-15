import { createRow } from '../utils/tanstack.helpers';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// Creation uses an application-owned initial row from the toolbar action.
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
          <button
            type="button"
            onClick={() =>
              table.setCreatingRow(
                createRow(table, { id: '', firstName: '', lastName: '', age: 0 }),
              )
            }
          >
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
          <button
            type="button"
            onClick={() =>
              table.setCreatingRow(
                createRow(table, { id: '', firstName: '', lastName: '', age: 0 }),
              )
            }
          >
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
