import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_RowSelectionState } from '../types';
import { people, personColumns } from './fixtures';

function Harness() {
  const [rowSelection, setRowSelection] = useState<SST_RowSelectionState>({});
  return (
    <>
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 3)}
        enableRowSelection
        getRowId={(row) => row.id}
        state={{ rowSelection }}
        onRowSelectionChange={setRowSelection}
      />
      <div data-testid="selection-state">{JSON.stringify(rowSelection)}</div>
    </>
  );
}

describe('ShadStackTable — row selection', () => {
  it('flips rowSelection state when a row checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /toggle select row/i });
    expect(rowCheckboxes).toHaveLength(3);

    await user.click(rowCheckboxes[0]);

    expect(screen.getByTestId('selection-state')).toHaveTextContent('"p001":true');
  });
});
