import { useMemo } from 'react';
import {
  MaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'shadstack-table';
import { Mail, Send, UserCheck, UserCircle, UserX } from 'lucide-react';
import { type Employee, employees } from './data/employees';

const usd = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

// Color band for salary chip — bucket boundaries chosen so the demo
// data spreads across all three buckets visibly.
const salaryColor = (n: number) => {
  if (n < 100_000) return 'bg-muted text-muted-foreground';
  if (n < 180_000) return 'bg-chart-2/30 text-foreground';
  return 'bg-chart-1/30 text-foreground';
};

export function AdvancedExample() {
  const columns = useMemo<MRT_ColumnDef<Employee>[]>(
    () => [
      {
        id: 'employee',
        header: 'Employee',
        columns: [
          {
            id: 'name',
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            header: 'Name',
            size: 240,
            Cell: ({ renderedCellValue, row }) => (
              <div className="flex items-center gap-3">
                <img
                  alt=""
                  src={row.original.avatar}
                  width={32}
                  height={32}
                  loading="lazy"
                  className="size-8 rounded-full border bg-muted"
                />
                {/* renderedCellValue preserves match-highlight markup when global filter is active */}
                <span className="truncate">{renderedCellValue}</span>
              </div>
            ),
          },
          {
            accessorKey: 'email',
            header: 'Email',
            size: 260,
            enableClickToCopy: true,
            // TODO(post-v1): filterVariant 'autocomplete' is per PORT_PLAN punted to v1.x.
            // Falls back to Input text filter for now.
            filterVariant: 'autocomplete',
          },
        ],
      },
      {
        id: 'position',
        header: 'Position',
        columns: [
          {
            accessorKey: 'salary',
            header: 'Salary',
            size: 140,
            filterFn: 'between',
            Cell: ({ cell }) => {
              const v = cell.getValue<number>();
              return (
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${salaryColor(v)}`}
                >
                  {usd(v)}
                </span>
              );
            },
          },
          {
            accessorKey: 'jobTitle',
            header: 'Job Title',
            size: 220,
          },
          {
            id: 'startDate',
            accessorFn: (row) => new Date(row.startDate),
            header: 'Start Date',
            size: 160,
            sortingFn: 'datetime',
            // TODO(post-v1): filterVariant 'date' is stubbed with <input type="date"> per PORT_PLAN.
            filterVariant: 'date',
            filterFn: 'lessThan',
            Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
            // Custom Header renderer — italicizes the column title.
            Header: ({ column }) => <em>{column.columnDef.header as string}</em>,
          },
        ],
      },
      {
        id: 'org',
        header: 'Org',
        columns: [
          {
            accessorKey: 'department',
            header: 'Department',
            size: 160,
            filterVariant: 'multi-select',
          },
        ],
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: employees,
    enableColumnFilterModes: true,
    // TODO(post-v1): column drag-reorder is deferred per GOAL.md non-goals.
    // Flag wired here so the toolbar button renders, but the drag handle is a no-op.
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: true,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ['mrt-row-select'],
        right: ['mrt-row-actions'],
      },
      pagination: { pageSize: 10, pageIndex: 0 },
    },
    renderDetailPanel: ({ row }) => (
      <div className="flex items-center gap-8 px-8 py-6">
        <img
          alt=""
          src={row.original.avatar}
          width={120}
          height={120}
          className="size-30 rounded-full border bg-muted"
        />
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Signature phrase</p>
          <blockquote className="text-foreground mt-1 text-xl italic">
            &ldquo;{row.original.signaturePhrase}&rdquo;
          </blockquote>
        </div>
      </div>
    ),
    renderRowActionMenuItems: ({ closeMenu }) => [
      <button
        key="profile"
        type="button"
        className="hover:bg-accent flex w-full items-center gap-2 px-2 py-1.5 text-sm"
        onClick={() => {
          // View profile (stub for the demo)
          closeMenu();
        }}
      >
        <UserCircle className="size-4" />
        View profile
      </button>,
      <button
        key="email"
        type="button"
        className="hover:bg-accent flex w-full items-center gap-2 px-2 py-1.5 text-sm"
        onClick={() => {
          // Send email (stub for the demo)
          closeMenu();
        }}
      >
        <Send className="size-4" />
        Send email
      </button>,
    ],
    renderTopToolbar: ({ table: t }) => {
      const selectedCount = t.getSelectedRowModel().flatRows.length;
      const hasSelection = selectedCount > 0;

      const onBulk = (label: string) => () => {
        const names = t
          .getSelectedRowModel()
          .flatRows.map((r) => r.getValue('name') as string)
          .join(', ');
        // Stubbed bulk action — alert is fine for a demo
        alert(`${label}: ${names}`);
      };

      return (
        <div className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 border-b p-2">
          <div className="flex items-center gap-2">
            <MRT_GlobalFilterTextField table={t} />
            <MRT_ToggleFiltersButton table={t} />
            {hasSelection && (
              <span className="text-muted-foreground text-sm">{selectedCount} selected</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasSelection}
              onClick={onBulk('Deactivate')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium shadow-xs transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              <UserX className="size-4" />
              Deactivate
            </button>
            <button
              type="button"
              disabled={!hasSelection}
              onClick={onBulk('Activate')}
              className="bg-chart-2 text-foreground hover:bg-chart-2/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium shadow-xs transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              <UserCheck className="size-4" />
              Activate
            </button>
            <button
              type="button"
              disabled={!hasSelection}
              onClick={onBulk('Contact')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium shadow-xs transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              <Mail className="size-4" />
              Contact
            </button>
          </div>
        </div>
      );
    },
  });

  return <MaterialReactTable table={table} />;
}
