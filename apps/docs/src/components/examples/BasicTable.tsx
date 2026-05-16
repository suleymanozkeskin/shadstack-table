import { useMemo } from 'react';
import { ShadStackTable, useShadStackTable, type SST_ColumnDef } from 'shadstack-table';

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  role: 'engineer' | 'designer' | 'manager';
  city: string;
};

const people: Person[] = [
  { id: 1, firstName: 'Ada', lastName: 'Lovelace', role: 'engineer', city: 'London' },
  { id: 2, firstName: 'Grace', lastName: 'Hopper', role: 'engineer', city: 'New York' },
  { id: 3, firstName: 'Linus', lastName: 'Torvalds', role: 'engineer', city: 'Helsinki' },
  { id: 4, firstName: 'Margaret', lastName: 'Hamilton', role: 'engineer', city: 'Boston' },
  { id: 5, firstName: 'Dieter', lastName: 'Rams', role: 'designer', city: 'Frankfurt' },
  { id: 6, firstName: 'Susan', lastName: 'Kare', role: 'designer', city: 'San Francisco' },
  { id: 7, firstName: 'Paul', lastName: 'Rand', role: 'designer', city: 'New York' },
  { id: 8, firstName: 'Satya', lastName: 'Nadella', role: 'manager', city: 'Redmond' },
];

export function BasicTable() {
  const columns = useMemo<SST_ColumnDef<Person>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'firstName', header: 'First name' },
      { accessorKey: 'lastName', header: 'Last name' },
      {
        accessorKey: 'role',
        header: 'Role',
        filterVariant: 'select',
        filterSelectOptions: ['engineer', 'designer', 'manager'],
      },
      { accessorKey: 'city', header: 'City' },
    ],
    [],
  );

  const table = useShadStackTable({
    columns,
    data: people,
    enableSorting: true,
    enableColumnFilters: true,
    enablePagination: false,
    initialState: { density: 'compact' },
  });

  return (
    <div className="sst-example">
      <ShadStackTable table={table} />
    </div>
  );
}
