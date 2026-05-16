import { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'shadstack-table';
import { type Person, people } from './data/people';

export function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const columns = useMemo<MRT_ColumnDef<Person>[]>(
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

  const table = useMaterialReactTable({
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

  return (
    <div className="overflow-x-hidden">
      <main className="bg-background text-foreground min-h-screen p-6">
        <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">shadstack-table</h1>
            <p className="text-muted-foreground text-sm">playground · smoke test for the port</p>
          </div>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="border-input hover:bg-accent rounded-md border bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors"
          >
            {dark ? 'Light' : 'Dark'} mode
          </button>
        </header>

        <section className="mx-auto max-w-6xl min-w-0 overflow-hidden">
          <MaterialReactTable table={table} />
        </section>
      </main>
    </div>
  );
}
