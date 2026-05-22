import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// Modal edit flow: open dialog, change a field, save → onEditingRowSave fires
// with the new value.
describe('ShadStackTable — editing (modal mode)', () => {
  it('opens edit modal, accepts input changes, and calls onEditingRowSave with new values', async () => {
    const user = userEvent.setup();
    const onEditingRowSave = vi.fn();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        editDisplayMode="modal"
        getRowId={(row) => row.id}
        onEditingRowSave={onEditingRowSave}
      />,
    );

    // Each row gets an "Edit" pencil button.
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    expect(editButtons).toHaveLength(2);

    await user.click(editButtons[0]);

    // Wait for the dialog to open. Scope all further queries to it — the
    // sort-label tooltip in the table header also matches /first name/i.
    const dialog = await screen.findByRole('dialog');
    const dialogScope = within(dialog);

    const firstNameInput = dialogScope.getByLabelText(/first name/i);
    expect(firstNameInput).toHaveValue('Ada');

    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Augusta');

    await user.click(dialogScope.getByRole('button', { name: /^save$/i }));

    expect(onEditingRowSave).toHaveBeenCalledTimes(1);
    expect(onEditingRowSave.mock.calls[0][0].values).toMatchObject({
      firstName: 'Augusta',
    });
  });

  // Cancel must invoke onEditingRowCancel and close the dialog without
  // touching any save callback. Locks in #43's option-derivation refactor:
  // the cancel path reads from the consumer-provided callback through the
  // immutable statefulTableOptions spread, not from a mutated options bag.
  it('calls onEditingRowCancel and closes the dialog on Cancel', async () => {
    const user = userEvent.setup();
    const onEditingRowCancel = vi.fn();
    const onEditingRowSave = vi.fn();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        editDisplayMode="modal"
        getRowId={(row) => row.id}
        onEditingRowCancel={onEditingRowCancel}
        onEditingRowSave={onEditingRowSave}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: /^edit$/i })[0]);

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }));

    expect(onEditingRowCancel).toHaveBeenCalledTimes(1);
    expect(onEditingRowSave).not.toHaveBeenCalled();

    // Dialog is dismissed.
    await expect(screen.findByRole('dialog')).rejects.toBeTruthy();
  });

  // Create flow: setCreatingRow(true) opens an empty-row modal. The dialog
  // title is exercised by create-row-modal-title.test.tsx; here we verify
  // the save side — onCreatingRowSave fires with the typed values and the
  // exitCreatingMode helper closes the dialog.
  it('opens create modal and calls onCreatingRowSave with typed values', async () => {
    const user = userEvent.setup();
    const onCreatingRowSave = vi.fn(({ exitCreatingMode }) => {
      exitCreatingMode();
    });

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        createDisplayMode="modal"
        getRowId={(row) => row.id}
        onCreatingRowSave={onCreatingRowSave}
        renderTopToolbarCustomActions={({ table }) => (
          <button type="button" onClick={() => table.setCreatingRow(true)}>
            New person
          </button>
        )}
      />,
    );

    await user.click(screen.getByRole('button', { name: /new person/i }));

    const dialog = await screen.findByRole('dialog');
    const dialogScope = within(dialog);

    expect(dialogScope.getByRole('heading', { name: 'Create' })).toBeInTheDocument();

    const firstNameInput = dialogScope.getByLabelText(/first name/i);
    expect(firstNameInput).toHaveValue('');
    await user.type(firstNameInput, 'Hedy');

    await user.click(dialogScope.getByRole('button', { name: /^save$/i }));

    expect(onCreatingRowSave).toHaveBeenCalledTimes(1);
    expect(onCreatingRowSave.mock.calls[0][0].values).toMatchObject({
      firstName: 'Hedy',
    });

    // exitCreatingMode in the save callback closes the dialog.
    await expect(screen.findByRole('dialog')).rejects.toBeTruthy();
  });

  it('calls onCreatingRowCancel and closes the dialog on Cancel from the create flow', async () => {
    const user = userEvent.setup();
    const onCreatingRowCancel = vi.fn();
    const onCreatingRowSave = vi.fn();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        createDisplayMode="modal"
        getRowId={(row) => row.id}
        onCreatingRowCancel={onCreatingRowCancel}
        onCreatingRowSave={onCreatingRowSave}
        renderTopToolbarCustomActions={({ table }) => (
          <button type="button" onClick={() => table.setCreatingRow(true)}>
            New person
          </button>
        )}
      />,
    );

    await user.click(screen.getByRole('button', { name: /new person/i }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }));

    expect(onCreatingRowCancel).toHaveBeenCalledTimes(1);
    expect(onCreatingRowSave).not.toHaveBeenCalled();

    await expect(screen.findByRole('dialog')).rejects.toBeTruthy();
  });
});
