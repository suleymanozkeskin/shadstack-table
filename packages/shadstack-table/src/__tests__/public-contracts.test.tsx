import { createRow } from '../utils/tanstack.helpers';
import { createRef } from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { useShadStackTable } from '../hooks/useShadStackTable';
import { getSST_Theme } from '../utils/style.utils';
import { people, personColumns, personColumnsWithAge } from './fixtures';

describe('component and public type contracts', () => {
  it('passes the frozen default theme to theme callbacks', () => {
    const theme = getSST_Theme((defaults) => {
      expect(Object.isFrozen(defaults)).toBe(true);
      expect(defaults.baseBackgroundColor).toBe('var(--background)');

      return { menuBackgroundColor: defaults.baseBackgroundColor };
    });

    expect(theme.menuBackgroundColor).toBe('var(--background)');
    expect(theme.draggingBorderColor).toBe('var(--primary)');
  });

  it('sets and clears object refs supplied through slots', () => {
    const paperRef = createRef<HTMLDivElement>();

    const view = render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        slotProps={{ tablePaper: { ref: paperRef } }}
      />,
    );

    expect(paperRef.current?.tagName).toBe('DIV');
    view.unmount();
    expect(paperRef.current).toBeNull();
  });

  it('can switch between options and an existing table', () => {
    const { result } = renderHook(() =>
      useShadStackTable({ columns: personColumns, data: people }),
    );

    const view = render(<ShadStackTable columns={personColumns} data={people} />);

    view.rerender(<ShadStackTable table={result.current} />);
    expect(view.getByRole('table')).toBeInTheDocument();
    view.rerender(<ShadStackTable columns={personColumns} data={people} />);
    expect(view.getByRole('table')).toBeInTheDocument();
  });
  it('reads the full current state through the public state property', () => {
    const { result } = renderHook(() =>
      useShadStackTable({ columns: personColumns, data: people }),
    );

    act(() => result.current.setDensity('compact'));
    expect(result.current.state.density).toBe('compact');
    expect(result.current.state.columnResizing.isResizingColumn).toBe(false);
  });

  it('accepts a typed row from a creating-row updater', () => {
    const { result } = renderHook(() =>
      useShadStackTable({ columns: personColumns, data: people }),
    );

    act(() =>
      result.current.setCreatingRow(() =>
        createRow(result.current, { id: '', firstName: '', lastName: '', age: 0 }),
      ),
    );
    const row = result.current.getState().creatingRow;
    expect(row?.id).toBe('sst-row-create');
    expect(row?.getAllCells()).toHaveLength(result.current.getAllLeafColumns().length);
  });

  it('keeps state setter identities across host renders', () => {
    const { result } = renderHook(() =>
      useShadStackTable({ columns: personColumns, data: people }),
    );

    const setDensity = result.current.setDensity;

    act(() => result.current.setGlobalFilterFn('contains'));
    expect(result.current.setDensity).toBe(setDensity);
  });

  it('preserves typed initial numbers, dates, and nested values', () => {
    const initial = { name: '', age: 0, joinedAt: new Date('2026-01-01'), address: { city: '' } };

    const { result } = renderHook(() =>
      useShadStackTable({
        columns: [{ accessorKey: 'name', header: 'Name' }],
        data: [initial],
      }),
    );

    const row = createRow(result.current, initial);
    expect(row.original).toBe(initial);
    expect(row.original.age).toBe(0);
    expect(row.original.joinedAt).toBe(initial.joinedAt);
    expect(row.original.address).toBe(initial.address);
  });

  it('combines named and inline aggregation definitions', () => {
    const { result } = renderHook(() =>
      useShadStackTable({
        columns: [
          { accessorKey: 'group', header: 'Group' },
          {
            accessorKey: 'amount',
            header: 'Amount',
            aggregationFn: ['sum', { aggregate: () => 123 }],
          },
        ],
        data: [
          { group: 'a', amount: 2 },
          { group: 'a', amount: 3 },
        ],
        enableGrouping: true,
        initialState: { grouping: ['group'] },
      }),
    );

    expect(result.current.getGroupedRowModel().rows[0].getValue('amount')).toEqual([5, 123]);
  });

  it('keeps editor text separate from typed row values', () => {
    const { result } = renderHook(() =>
      useShadStackTable({ columns: personColumnsWithAge, data: people }),
    );

    const row = result.current.getRowModel().rows[0];
    const age = row.getValue('age');
    result.current.setEditValue(row, 'age', '42');
    const values = result.current.getEditValues(row);
    expect(values.age).toBe('42');
    expect(Object.isFrozen(values)).toBe(true);
    expect(row.getValue('age')).toBe(age);
    expect(row.original.age).toBe(people[0].age);
    result.current.clearEditValues(row);
    expect(result.current.getEditedValue(row, 'age')).toBeUndefined();
    expect(row.getValue('age')).toBe(age);
  });
});
