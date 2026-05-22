import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// Cell-edit display mode opens an inline <input> on double-click and commits
// on Enter or blur. There is no Escape-to-cancel — the commit fires
// unconditionally on blur, matching upstream MRT semantics.
//
// We intentionally do NOT pass onEditingCellChange — providing it replaces
// the internal setEditingCell entirely (see useSST_TableInstance:304), so
// the spy would prevent the inline input from ever rendering. The DOM
// assertions below cover the same behaviour without spying.

describe('ShadStackTable — editing (cell mode)', () => {
  it('commits typed value on Enter (which fires blur on the input)', async () => {
    const user = userEvent.setup();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 1)}
        enableEditing
        editDisplayMode="cell"
        getRowId={(row) => row.id}
      />,
    );

    // Anchor on the row containing Ada; the body cell renders the raw value
    // until edit mode is open.
    const adaRow = screen.getByText('Ada').closest('tr');
    expect(adaRow).not.toBeNull();
    const firstNameCell = within(adaRow!).getByText('Ada');

    await user.dblClick(firstNameCell);

    // The cell content is now an editable input. Auto-select fires from a
    // queueMicrotask after the click, so the input is in the DOM.
    const input = within(adaRow!).getByDisplayValue('Ada');
    expect(input.tagName).toBe('INPUT');

    await user.clear(input);
    await user.type(input, 'Augusta');

    // Enter calls input.blur(); commitEditOnBlur writes the value into the
    // row's value cache and clears the editing cell.
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);

    // After commit the editable input is gone and the cell shows the new value.
    expect(within(adaRow!).queryByRole('textbox')).toBeNull();
    expect(within(adaRow!).getByText('Augusta')).toBeInTheDocument();
  });

  it('commits typed value on natural blur (click outside)', async () => {
    const user = userEvent.setup();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 1)}
        enableEditing
        editDisplayMode="cell"
        getRowId={(row) => row.id}
      />,
    );

    const adaRow = screen.getByText('Ada').closest('tr')!;
    await user.dblClick(within(adaRow).getByText('Ada'));

    const input = within(adaRow).getByDisplayValue('Ada');
    await user.clear(input);
    await user.type(input, 'Grace');

    // Blur explicitly — happy-dom doesn't dispatch blur from a click on
    // arbitrary DOM. The blur handler commits to the value cache.
    fireEvent.blur(input);

    expect(within(adaRow).queryByRole('textbox')).toBeNull();
    expect(within(adaRow).getByText('Grace')).toBeInTheDocument();
  });

  it('does not open the inline input when enableEditing is false', async () => {
    const user = userEvent.setup();

    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 1)}
        editDisplayMode="cell"
        getRowId={(row) => row.id}
      />,
    );

    const adaRow = screen.getByText('Ada').closest('tr')!;
    await user.dblClick(within(adaRow).getByText('Ada'));

    expect(within(adaRow).queryByRole('textbox')).toBeNull();
  });
});
