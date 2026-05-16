import { useMemo } from 'react';
import { ShadStackTable, useShadStackTable, type SST_ColumnDef } from 'shadstack-table';
import { type Person, people } from './data/people';

export function BasicExample() {
  const columns = useMemo<SST_ColumnDef<Person>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 80, enableEditing: false },
      { accessorKey: 'firstName', header: 'First name' },
      { accessorKey: 'lastName', header: 'Last name' },
      { accessorKey: 'age', header: 'Age', filterVariant: 'range' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        filterVariant: 'select',
        filterSelectOptions: ['engineer', 'designer', 'manager', 'analyst'],
      },
      {
        accessorKey: 'status',
        header: 'Status',
        filterVariant: 'multi-select',
        filterSelectOptions: ['active', 'invited', 'suspended'],
      },
      { accessorKey: 'joinedAt', header: 'Joined' },
      { accessorKey: 'city', header: 'City' },
    ],
    [],
  );

  const table = useShadStackTable({
    columns,
    data: people,
    enableRowSelection: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enablePagination: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableExpanding: false,
    enableEditing: true,
    editDisplayMode: 'modal',
    initialState: {
      density: 'compact',
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  return <ShadStackTable table={table} />;
}
