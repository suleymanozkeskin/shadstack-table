import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

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
});
