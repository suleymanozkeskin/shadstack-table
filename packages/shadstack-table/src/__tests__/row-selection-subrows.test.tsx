import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_RowSelectionState } from '../types';
import { type NestedPerson, nestedPeople, personColumns } from './fixtures';

/**
 * Sub-row selection cascade.
 *
 * The cascade itself lives in TanStack — `toggleSelected` applies it when
 * `opts.selectChildren` is unset, which shadstack never passes — while
 * `utils/row.utils.ts` separately clears children when all of them were
 * selected. These tests pin the observable result of that pairing, which no
 * other test in the suite exercises.
 */
function Harness({ selectAllMode }: { selectAllMode?: 'all' | 'page' } = {}) {
  const [rowSelection, setRowSelection] = useState<SST_RowSelectionState>({});
  return (
    <>
      <ShadStackTable<NestedPerson>
        columns={personColumns}
        data={nestedPeople}
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
