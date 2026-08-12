import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type TableState } from '@tanstack/react-table';
import { ShadStackTable } from '../components/ShadStackTable';
import { SST_STATE_DEFAULTS, type SST_Features } from '../features';
import { useShadStackTable } from '../hooks/useShadStackTable';
import { type SST_TableInstance, type SST_TableOptions } from '../types';
import { people, personColumns, type Person } from './fixtures';

// Every shadstack state slice is registered as real TanStack table state via
// shadstackCoreFeature, so each one is backed by a base atom, a derived atom,
// and a key in table.store's snapshot. These tests pin that ownership: a slice
// that silently loses its atom (or a setter that stops writing) fails here
// even though nothing in the type system would notice.

//shadstack slice keys must NOT leak into the TanStack-derived state type —
//the feature is added with a local cast precisely so consumer-visible
//TanStack types stay untouched.
type TanStackDerivedState = TableState<SST_Features>;
const shadstackKeysStayOut: 'density' extends keyof TanStackDerivedState ? never : true = true;
void shadstackKeysStayOut;

const STOCK_SLICES = [
  'columnFilters',
  'columnOrder',
  'columnPinning',
  'columnResizing',
  'columnSizing',
  'columnVisibility',
  'expanded',
  'globalFilter',
  'grouping',
  'pagination',
  'rowPinning',
  'rowSelection',
  'sorting',
] as const;

let capturedTable: SST_TableInstance<Person>;

const Harness = (options: Partial<SST_TableOptions<Person>>) => {
  const table = useShadStackTable<Person>({
    columns: personColumns,
    data: people,
    ...options,
  });
  capturedTable = table;
  return <ShadStackTable table={table} />;
};

describe('state ownership — every slice is atom-backed', () => {
  it('the store snapshot and atom maps carry every shadstack and stock slice', () => {
    render(<Harness />);
    const table = capturedTable;
    const snapshot = table.getState() as unknown as Record<string, unknown>;

    for (const key of [...Object.keys(SST_STATE_DEFAULTS), ...STOCK_SLICES]) {
      expect(snapshot, `store snapshot is missing '${key}'`).toHaveProperty(key);
      expect(
        (table.atoms as Record<string, unknown>)[key],
        `derived atom missing for '${key}'`,
      ).toBeDefined();
      expect(
        (table.baseAtoms as Record<string, unknown>)[key],
        `base atom missing for '${key}'`,
      ).toBeDefined();
    }
  });

  it('tri-state display flags seed as undefined (auto), not false (opted out)', () => {
    render(<Harness />);
    const { showLoadingOverlay, showProgressBars, showSkeletons } = capturedTable.getState();
    expect(showLoadingOverlay).toBeUndefined();
    expect(showProgressBars).toBeUndefined();
    expect(showSkeletons).toBeUndefined();
  });

  it('every public setter writes its slice, notifies the store, and getState reads it back', () => {
    render(<Harness />);
    const table = capturedTable;
    const row = table.getRowModel().rows[0]!;
    const cell = row.getAllCells()[0]!;
    const column = table.getAllLeafColumns()[0]!;

    const writes: Array<[string, () => void, () => unknown, unknown]> = [
      ['density', () => table.setDensity('compact'), () => table.getState().density, 'compact'],
      [
        'isFullScreen',
        () => table.setIsFullScreen(true),
        () => table.getState().isFullScreen,
        true,
      ],
      [
        'showAlertBanner',
        () => table.setShowAlertBanner(true),
        () => table.getState().showAlertBanner,
        true,
      ],
      [
        'showColumnFilters',
        () => table.setShowColumnFilters(true),
        () => table.getState().showColumnFilters,
        true,
      ],
      [
        'showGlobalFilter',
        () => table.setShowGlobalFilter(true),
        () => table.getState().showGlobalFilter,
        true,
      ],
      [
        'showToolbarDropZone',
        () => table.setShowToolbarDropZone(true),
        () => table.getState().showToolbarDropZone,
        true,
      ],
      [
        'globalFilterFn',
        () => table.setGlobalFilterFn('contains'),
        () => table.getState().globalFilterFn,
        'contains',
      ],
      [
        'columnFilterFns',
        () => table.setColumnFilterFns((old) => ({ ...old, firstName: 'startsWith' })),
        () => table.getState().columnFilterFns.firstName,
        'startsWith',
      ],
      ['actionCell', () => table.setActionCell(cell), () => table.getState().actionCell, cell],
      ['editingCell', () => table.setEditingCell(cell), () => table.getState().editingCell, cell],
      ['editingRow', () => table.setEditingRow(row), () => table.getState().editingRow, row],
      ['draggingRow', () => table.setDraggingRow(row), () => table.getState().draggingRow, row],
      [
        'draggingColumn',
        () => table.setDraggingColumn(column),
        () => table.getState().draggingColumn,
        column,
      ],
      ['hoveredRow', () => table.setHoveredRow(row), () => table.getState().hoveredRow, row],
      [
        'hoveredColumn',
        () => table.setHoveredColumn(column),
        () => table.getState().hoveredColumn,
        column,
      ],
    ];

    for (const [key, write, read, expected] of writes) {
      let notified = 0;
      const sub = (
        table.atoms as Record<
          string,
          { subscribe: (fn: () => void) => { unsubscribe: () => void } }
        >
      )[key]!.subscribe(() => notified++);
      act(() => write());
      expect(read(), `'${key}' did not update through its setter`).toBe(expected);
      expect(notified, `'${key}' atom did not notify its subscriber`).toBeGreaterThan(0);
      sub.unsubscribe();
    }
  });

  it('setCreatingRow(true) constructs a blank row through the feature setter', () => {
    render(<Harness />);
    act(() => capturedTable.setCreatingRow(true));
    const creatingRow = capturedTable.getState().creatingRow;
    expect(creatingRow).not.toBeNull();
    expect(creatingRow!.id).toBe('sst-row-create');
    //methods must be live — the row is a real constructed Row instance
    expect(typeof creatingRow!.getAllCells).toBe('function');
  });

  it('a consumer on*Change handler intercepts the write and owns the slice', () => {
    const onDensityChange = vi.fn();
    render(<Harness onDensityChange={onDensityChange} state={{ density: 'spacious' }} />);
    const table = capturedTable;

    act(() => table.setDensity('compact'));

    //handler received the raw value (not a wrapped updater), and the slice
    //stayed at the controlled value because the consumer never applied it
    expect(onDensityChange).toHaveBeenCalledWith('compact');
    expect(table.getState().density).toBe('spacious');
  });

  it('a consumer-controlled slice reads through options.state precedence', () => {
    render(<Harness state={{ isLoading: true }} />);
    expect(capturedTable.getState().isLoading).toBe(true);
    //skeleton cells render instead of data
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
  });

  it('table.reset() returns shadstack slices to their initial values', () => {
    render(<Harness initialState={{ density: 'spacious' }} />);
    const table = capturedTable;

    act(() => {
      table.setDensity('compact');
      table.setShowGlobalFilter(true);
    });
    expect(table.getState().density).toBe('compact');

    act(() => table.reset());

    expect(table.getState().density).toBe('spacious');
    expect(table.getState().showGlobalFilter).toBe(false);
  });

  it('read-after-write inside one handler sees the written value', () => {
    render(<Harness />);
    const table = capturedTable;
    let observed: unknown;
    act(() => {
      table.setDensity('compact');
      observed = table.getState().density;
    });
    expect(observed).toBe('compact');
  });

  it('TanStack-owned slices still flow end to end (pagination via public API)', async () => {
    render(<Harness initialState={{ pagination: { pageIndex: 0, pageSize: 2 } }} />);
    const table = capturedTable;
    const firstPageRows = table.getRowModel().rows.map((r) => r.original.firstName);

    act(() => table.setPageIndex(1));

    expect(table.getState().pagination.pageIndex).toBe(1);
    const secondPageRows = table.getRowModel().rows.map((r) => r.original.firstName);
    expect(secondPageRows).not.toEqual(firstPageRows);
  });
});
