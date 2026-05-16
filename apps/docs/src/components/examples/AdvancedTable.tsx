import { useMemo } from 'react';
import { ShadStackTable, useShadStackTable, type SST_ColumnDef } from 'shadstack-table';

type Employee = {
  id: number;
  name: string;
  email: string;
  department: 'Engineering' | 'Design' | 'Sales';
  salary: number;
  startDate: string;
};

const employees: Employee[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    department: 'Engineering',
    salary: 180000,
    startDate: '2024-01-12',
  },
  {
    id: 2,
    name: 'Grace Hopper',
    email: 'grace@example.com',
    department: 'Engineering',
    salary: 210000,
    startDate: '2023-07-04',
  },
  {
    id: 3,
    name: 'Linus Torvalds',
    email: 'linus@example.com',
    department: 'Engineering',
    salary: 230000,
    startDate: '2022-11-22',
  },
  {
    id: 4,
    name: 'Susan Kare',
    email: 'susan@example.com',
    department: 'Design',
    salary: 165000,
    startDate: '2024-03-15',
  },
  {
    id: 5,
    name: 'Dieter Rams',
    email: 'dieter@example.com',
    department: 'Design',
    salary: 195000,
    startDate: '2021-05-30',
  },
  {
    id: 6,
    name: 'Paul Rand',
    email: 'paul@example.com',
    department: 'Design',
    salary: 140000,
    startDate: '2025-02-08',
  },
  {
    id: 7,
    name: 'Satya Nadella',
    email: 'satya@example.com',
    department: 'Sales',
    salary: 250000,
    startDate: '2020-09-01',
  },
  {
    id: 8,
    name: 'Tim Cook',
    email: 'tim@example.com',
    department: 'Sales',
    salary: 245000,
    startDate: '2019-04-17',
  },
];

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function AdvancedTable() {
  const columns = useMemo<SST_ColumnDef<Employee>[]>(
    () => [
      { accessorKey: 'name', header: 'Name', size: 200 },
      { accessorKey: 'email', header: 'Email', size: 240, enableClickToCopy: true },
      {
        accessorKey: 'department',
        header: 'Department',
        filterVariant: 'multi-select',
        filterSelectOptions: ['Engineering', 'Design', 'Sales'],
        size: 160,
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        size: 140,
        filterFn: 'between',
        Cell: ({ cell }) => <span>{usd(cell.getValue<number>())}</span>,
      },
      {
        id: 'startDate',
        accessorFn: (row) => new Date(row.startDate),
        header: 'Start date',
        size: 160,
        sortingFn: 'datetime',
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
      },
    ],
    [],
  );

  const table = useShadStackTable({
    columns,
    data: employees,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableRowSelection: true,
    initialState: {
      showColumnFilters: true,
      density: 'compact',
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  return (
    <div className="sst-example">
      <ShadStackTable table={table} />
    </div>
  );
}
