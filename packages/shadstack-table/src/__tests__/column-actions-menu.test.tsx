import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { SST_COLUMN_MENU_ITEM_IDS } from '../constants';
import { type SST_ColumnDef } from '../types';
import { type Person, people, personColumns } from './fixtures';

const openFirstNameMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  const buttons = await screen.findAllByRole('button', { name: /column actions/i });
  await user.click(buttons[0]!);
};

describe('ShadStackTable — column actions menu', () => {
  it('shows the filter-by-column entry by default', async () => {
    const user = userEvent.setup();
    render(<ShadStackTable columns={personColumns} data={people} />);

    await openFirstNameMenu(user);

    expect(await screen.findByText('Filter by First name')).toBeInTheDocument();
    expect(screen.getByText('Clear filter')).toBeInTheDocument();
  });

  it('drops the entry table-wide when enableFilterByColumnMenuItem is false', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable columns={personColumns} data={people} enableFilterByColumnMenuItem={false} />,
    );

    await openFirstNameMenu(user);

    // Clear-filter shares the same gate, so it must survive — dropping both is
    // what enableColumnFilter: false already does.
    expect(await screen.findByText('Clear filter')).toBeInTheDocument();
    expect(screen.queryByText('Filter by First name')).not.toBeInTheDocument();
  });

  it('lets a column opt out while its siblings keep the entry', async () => {
    const user = userEvent.setup();
    const columns: SST_ColumnDef<Person>[] = [
      { accessorKey: 'firstName', header: 'First name', enableFilterByColumnMenuItem: false },
      { accessorKey: 'lastName', header: 'Last name' },
    ];
    render(<ShadStackTable columns={columns} data={people} />);

    const buttons = await screen.findAllByRole('button', { name: /column actions/i });

    await user.click(buttons[0]!);
    expect(await screen.findByText('Clear filter')).toBeInTheDocument();
    expect(screen.queryByText('Filter by First name')).not.toBeInTheDocument();

    await user.keyboard('{Escape}');

    await user.click(buttons[1]!);
    expect(await screen.findByText('Filter by Last name')).toBeInTheDocument();
  });

  it('keys internal menu items by stable id, not by position', async () => {
    const user = userEvent.setup();
    const seenKeys: (string | null)[] = [];

    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        renderColumnActionsMenuItems={({ internalColumnMenuItems }) => {
          seenKeys.push(...internalColumnMenuItems.map((item) => item.key));
          // No cast needed to reach `.key` — that is the point of the typing.
          return internalColumnMenuItems.filter(
            (item) => item.key !== SST_COLUMN_MENU_ITEM_IDS.hideColumn,
          );
        }}
      />,
    );

    await openFirstNameMenu(user);
    await screen.findByText('Filter by First name');

    expect(seenKeys).toContain(SST_COLUMN_MENU_ITEM_IDS.filterByColumn);
    expect(seenKeys).toContain(SST_COLUMN_MENU_ITEM_IDS.sortAsc);
    expect(seenKeys.every((key) => key === null || key.startsWith('sst-'))).toBe(true);
    expect(screen.queryByText('Hide First name column')).not.toBeInTheDocument();
  });
});
