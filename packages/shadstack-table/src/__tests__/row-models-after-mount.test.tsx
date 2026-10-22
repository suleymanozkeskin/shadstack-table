import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef } from '../types';
import { type Person, people, personColumns } from './fixtures';

// TanStack v9 keeps the feature set from table construction, so a row-model
// stage must keep working when the rows or the options that switch it change
// after mount. Each case mounts in one state and re-renders into another.

const noPeople: Person[] = [];

const bodyFirstNames = (): string[] =>
  Array.from(document.querySelectorAll('tbody tr')).map(
    (row) => row.querySelectorAll('td')[0]?.textContent ?? '',
  );

const descendingByFirstName = [{ id: 'firstName', desc: true }];

describe('ShadStackTable — row models after mount', () => {
  it('sorts on header click when the rows arrive after an empty first render', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ShadStackTable columns={personColumns} data={noPeople} />);
    rerender(<ShadStackTable columns={personColumns} data={people} />);

    const firstNameHeader = screen.getByRole('columnheader', { name: /first name/i });
    await user.click(within(firstNameHeader).getByText('First name'));
    await user.click(within(firstNameHeader).getByText('First name'));

    expect(firstNameHeader).toHaveAttribute('aria-sort', 'descending');
    expect(bodyFirstNames()[0]).toBe('Margaret');
  });

  it('sorts with an explicit manualSorting={false} when the rows arrive after an empty first render', () => {
    const { rerender } = render(
      <ShadStackTable
        columns={personColumns}
        data={noPeople}
        manualSorting={false}
        state={{ sorting: descendingByFirstName }}
      />,
    );
    rerender(
      <ShadStackTable
        columns={personColumns}
        data={people}
        manualSorting={false}
        state={{ sorting: descendingByFirstName }}
      />,
    );

    expect(bodyFirstNames()[0]).toBe('Margaret');
  });

  it('applies column filters when the rows arrive after an empty first render', () => {
    const state = { columnFilters: [{ id: 'firstName', value: 'Ada' }] };
    const { rerender } = render(
      <ShadStackTable columns={personColumns} data={noPeople} state={state} />,
    );
    rerender(<ShadStackTable columns={personColumns} data={people} state={state} />);

    expect(bodyFirstNames()).toEqual(['Ada']);
  });

  it('paginates when the rows arrive after an empty first render', () => {
    const initialState = { pagination: { pageIndex: 0, pageSize: 2 } };
    const { rerender } = render(
      <ShadStackTable columns={personColumns} data={noPeople} initialState={initialState} />,
    );
    rerender(<ShadStackTable columns={personColumns} data={people} initialState={initialState} />);

    expect(bodyFirstNames()).toEqual(['Ada', 'Grace']);
  });

  it('groups when the rows arrive after an empty first render', () => {
    type Employee = { department: string; name: string };
    const employees: Employee[] = [
      { department: 'Research', name: 'Ada' },
      { department: 'Research', name: 'Grace' },
      { department: 'Systems', name: 'Linus' },
    ];
    const employeeColumns: SST_ColumnDef<Employee>[] = [
      { accessorKey: 'department', header: 'Department' },
      { accessorKey: 'name', header: 'Name' },
    ];
    const state = { grouping: ['department'] };
    const { rerender } = render(
      <ShadStackTable
        columns={employeeColumns}
        data={[] as Employee[]}
        enableGrouping
        state={state}
      />,
    );
    rerender(
      <ShadStackTable columns={employeeColumns} data={employees} enableGrouping state={state} />,
    );

    // Collapsed groups: one body row per department.
    expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('starts sorting when manualSorting changes from true to false', () => {
    const { rerender } = render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        manualSorting
        state={{ sorting: descendingByFirstName }}
      />,
    );
    expect(bodyFirstNames()[0]).toBe('Ada');

    rerender(
      <ShadStackTable
        columns={personColumns}
        data={people}
        manualSorting={false}
        state={{ sorting: descendingByFirstName }}
      />,
    );

    expect(bodyFirstNames()[0]).toBe('Margaret');
  });

  it('ignores sorting state while enableSorting is false and applies it once enabled', () => {
    const { rerender } = render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableSorting={false}
        state={{ sorting: descendingByFirstName }}
      />,
    );
    expect(bodyFirstNames()[0]).toBe('Ada');

    rerender(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableSorting
        state={{ sorting: descendingByFirstName }}
      />,
    );

    expect(bodyFirstNames()[0]).toBe('Margaret');
  });

  it('starts paginating when enablePagination changes from false to true', () => {
    const initialState = { pagination: { pageIndex: 0, pageSize: 2 } };
    const { rerender } = render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enablePagination={false}
        initialState={initialState}
      />,
    );
    expect(bodyFirstNames()).toHaveLength(5);

    rerender(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enablePagination
        initialState={initialState}
      />,
    );

    expect(bodyFirstNames()).toEqual(['Ada', 'Grace']);
  });
});
