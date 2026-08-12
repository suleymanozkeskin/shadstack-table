import { memo } from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { useSST_TableContext } from '../hooks/useSST_TableContext';
import { useSST_TableState } from '../hooks/useSST_TableState';
import { useShadStackTable } from '../hooks/useShadStackTable';
import { type SST_TableInstance } from '../types';
import { people, personColumns, type Person } from './fixtures';

let capturedTable: SST_TableInstance<Person>;
const identities: SST_TableInstance<Person>[] = [];

const Harness = ({ children }: { children?: React.ReactNode }) => {
  const table = useShadStackTable<Person>({ columns: personColumns, data: people });
  capturedTable = table;
  identities.push(table);
  return (
    <>
      <ShadStackTable table={table} />
      {children}
    </>
  );
};

describe('stable table identity and context', () => {
  it('the hook returns the same instance across state-driven re-renders', () => {
    identities.length = 0;
    render(<Harness />);
    act(() => capturedTable.setDensity('compact'));
    act(() => capturedTable.setShowGlobalFilter(true));

    expect(identities.length).toBeGreaterThan(1);
    for (const identity of identities) {
      expect(identity).toBe(identities[0]);
    }
    //and the stable instance exposes the freshest state
    expect(identities[0]!.getState().density).toBe('compact');
  });

  it('useSST_TableContext reaches the table from a consumer-rendered cell', () => {
    const columns = [
      {
        accessorKey: 'firstName',
        header: 'First Name',
        Cell: () => {
          const table = useSST_TableContext<Person>();
          const { density } = useSST_TableState(table);
          return <span data-testid="ctx-probe">{density}</span>;
        },
      },
    ];
    render(<ShadStackTable columns={columns as never} data={people.slice(0, 1)} />);
    expect(screen.getAllByTestId('ctx-probe')[0]).toHaveTextContent('comfortable');
  });

  it('a subscription updates a component its parents never re-render', () => {
    //memo comparator always returns true: the parent can never re-render this
    //component. Only its own state subscription can update it — this is the
    //mechanism every stage-3 narrowed component relies on.
    const Frozen = memo(
      () => {
        const table = useSST_TableContext<Person>();
        const { density } = useSST_TableState(table, (s) => ({ density: s.density }));
        //options must also be readable live off the stable instance
        const { enableSorting } = table.options;
        return (
          <span data-testid="frozen-probe">
            {density}:{String(enableSorting)}
          </span>
        );
      },
      () => true,
    );

    //the probe must live under the provider, so ride it in through a slot,
    //which also hands us the instance for driving updates
    let slotTable: SST_TableInstance<Person> | undefined;
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        renderTopToolbarCustomActions={({ table }) => {
          slotTable = table;
          return <Frozen />;
        }}
      />,
    );
    const probe = screen.getByTestId('frozen-probe');
    expect(probe).toHaveTextContent('comfortable:true');

    act(() => slotTable!.setDensity('compact'));

    //the parent never re-rendered it (memo comparator is constant-true), so
    //this text change can only have come through the subscription
    expect(probe).toHaveTextContent('compact:true');
  });
});
