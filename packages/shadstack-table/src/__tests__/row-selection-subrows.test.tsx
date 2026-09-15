import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_RowSelectionState } from '../types';
import { type NestedPerson, nestedPeople, personColumns } from './fixtures';

/** TanStack applies parent selection changes to selectable children. */
function Harness({ selectAllMode }: { selectAllMode?: 'all' | 'page' } = {}) {
  const [rowSelection, setRowSelection] = useState<SST_RowSelectionState>({});

  return (
    <>
      <ShadStackTable<NestedPerson>
        columns={personColumns}
        data={nestedPeople}
        getSubRows={(row) => row.subRows}
        enableExpanding
        enableRowSelection
        getRowId={(row) => row.id}
        initialState={{ expanded: true }}
        selectAllMode={selectAllMode}
        state={{ rowSelection }}
        onRowSelectionChange={setRowSelection}
      />
      <div data-testid="selection-state">{JSON.stringify(rowSelection)}</div>
    </>
  );
}

const selectionState = () => screen.getByTestId('selection-state').textContent ?? '';

describe('ShadStackTable — sub-row selection', () => {
  it('renders parents and their expanded children as selectable rows', () => {
    render(<Harness />);
    // 2 parents + 4 children
    expect(screen.getAllByRole('checkbox', { name: /toggle select row/i })).toHaveLength(6);
  });

  it('selects and clears an uncontrolled parent and its children', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable<NestedPerson>
        columns={personColumns}
        data={nestedPeople}
        getSubRows={(row) => row.subRows}
        enableExpanding
        enableRowSelection
        initialState={{ expanded: true }}
      />,
    );
    const boxes = screen.getAllByRole('checkbox', { name: /toggle select row/i });
    await user.click(boxes[0]);

    for (const box of boxes.slice(0, 3)) expect(box).toHaveAttribute('data-state', 'checked');
    await user.click(boxes[0]);

    for (const box of boxes.slice(0, 3)) expect(box).toHaveAttribute('data-state', 'unchecked');
  });

  it('selecting a parent also selects its children', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /toggle select row/i });
    await user.click(rowCheckboxes[0]);

    const state = selectionState();
    expect(state).toContain('"n001":true');
    expect(state).toContain('"n001a":true');
    expect(state).toContain('"n001b":true');
    // the other parent's subtree is untouched
    expect(state).not.toContain('"n002"');
    expect(state).not.toContain('"n002a"');
  });

  it('deselecting a fully selected parent clears its children', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /toggle select row/i });
    await user.click(rowCheckboxes[0]);
    expect(selectionState()).toContain('"n001a":true');

    await user.click(rowCheckboxes[0]);

    const state = selectionState();

    for (const id of ['n001', 'n001a', 'n001b']) {
      expect(state === '{}' || !state.includes(`"${id}":true`)).toBe(true);
    }
  });

  it('selecting a single child does not select its siblings or its parent', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /toggle select row/i });
    // index 1 is the first child of the first parent
    await user.click(rowCheckboxes[1]);

    const state = selectionState();
    expect(state).toContain('"n001a":true');
    expect(state).not.toContain('"n001b":true');
    expect(state).not.toContain('"n001":true');
  });

  it('select-all covers parents and children', async () => {
    const user = userEvent.setup();
    render(<Harness selectAllMode="all" />);

    await user.click(screen.getByRole('checkbox', { name: /toggle select all/i }));

    const state = selectionState();

    for (const id of ['n001', 'n001a', 'n001b', 'n002', 'n002a', 'n002b']) {
      expect(state).toContain(`"${id}":true`);
    }
  });
});
