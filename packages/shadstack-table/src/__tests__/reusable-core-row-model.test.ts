import {
  createTable,
  getCoreRowModel,
  type ColumnDef,
  type Row,
  type RowData,
  type RowModel,
  type Table,
} from '@tanstack/react-table';
import { describe, expect, it } from 'vitest';
import { experimental_getReusableCoreRowModel } from '../utils/experimental_getReusableCoreRowModel';

type Person = {
  id: string;
  name: string;
  value: number;
};

type TreeNode = {
  children?: TreeNode[];
  id: string;
  value: number;
};

const personColumns: ColumnDef<Person>[] = [
  {
    accessorKey: 'name',
  },
  {
    accessorKey: 'value',
  },
];

function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    name: `Row ${index}`,
    value: index,
  }));
}

function updateRows(rows: Person[], changedIndexes: number[]): Person[] {
  const next = rows.slice();
  for (const index of changedIndexes) {
    next[index] = {
      ...next[index]!,
      value: next[index]!.value + 1,
    };
  }
  return next;
}

function makeTable<TData extends RowData>({
  columns,
  data,
  getCoreRowModelFactory,
  getRowId = (row: any) => row.id,
  getSubRows,
  state = {},
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  getCoreRowModelFactory: (table: Table<TData>) => () => RowModel<TData>;
  getRowId?: (row: TData, index: number, parent?: Row<TData>) => string;
  getSubRows?: (row: TData, index: number) => TData[] | undefined;
  state?: Record<string, unknown>;
}): Table<TData> {
  return createTable<TData>({
    columns,
    data,
    getCoreRowModel: getCoreRowModelFactory,
    getRowId,
    getSubRows,
    onStateChange: () => {},
    renderFallbackValue: null,
    state,
  } as any);
}

function setTableOptions<TData extends RowData>(
  table: Table<TData>,
  options: Partial<{
    columns: ColumnDef<TData>[];
    data: TData[];
    getRowId: (row: TData, index: number, parent?: Row<TData>) => string;
    getSubRows: (row: TData, index: number) => TData[] | undefined;
    state: Record<string, unknown>;
  }>,
) {
  table.setOptions((previous) => ({
    ...previous,
    ...options,
  }));
}

function rowsById<TData extends RowData>(model: RowModel<TData>) {
  return new Map(model.rows.map((row) => [row.id, row]));
}

describe('experimental_getReusableCoreRowModel', () => {
  it('shows current getCoreRowModel rebuilds every row when data array identity changes', () => {
    const data = makePeople(100);
    const table = makeTable({
      columns: personColumns,
      data,
      getCoreRowModelFactory: getCoreRowModel<Person>(),
    });
    const first = table.getRowModel();

    setTableOptions(table, { data: updateRows(data, [1, 7, 42]) });
    const second = table.getRowModel();

    expect(second.rows.filter((row, index) => row === first.rows[index]).length).toBe(0);
  });

  it('reuses unchanged rows and cells while recreating changed rows', () => {
    const data = makePeople(100);
    const table = makeTable({
      columns: personColumns,
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<Person>(),
    });
    const first = table.getRowModel();
    const firstCells = first.rows[10]!.getAllCells();

    setTableOptions(table, { data: updateRows(data, [1, 7, 42]) });
    const second = table.getRowModel();

    expect(second.rows[1]).not.toBe(first.rows[1]);
    expect(second.rows[7]).not.toBe(first.rows[7]);
    expect(second.rows[42]).not.toBe(first.rows[42]);
    expect(second.rows[10]).toBe(first.rows[10]);
    expect(second.rows[10]!.getAllCells()).toBe(firstCells);
  });

  it('does not reuse rows when stable ids point at newly-created originals', () => {
    const data = makePeople(5);
    const table = makeTable({
      columns: personColumns,
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<Person>(),
    });
    const first = table.getRowModel();
    const recreated = data.map((row) => ({ ...row }));

    setTableOptions(table, { data: recreated });
    const second = table.getRowModel();

    expect(second.rows.every((row, index) => row !== first.rows[index])).toBe(true);
  });

  it('does not reuse moved rows even when their ids and originals are stable', () => {
    const data = makePeople(3);
    const table = makeTable({
      columns: personColumns,
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<Person>(),
    });
    const firstById = rowsById(table.getRowModel());

    setTableOptions(table, { data: [data[1]!, data[0]!, data[2]!] });
    const second = table.getRowModel();

    expect(second.rowsById['row-0']).not.toBe(firstById.get('row-0'));
    expect(second.rowsById['row-1']).not.toBe(firstById.get('row-1'));
    expect(second.rowsById['row-2']).toBe(firstById.get('row-2'));
  });

  it('resets reuse when column accessors change so cached row values cannot go stale', () => {
    const data = makePeople(1);
    const table = makeTable({
      columns: [
        {
          accessorFn: (row) => row.value,
          id: 'value',
        },
      ],
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<Person>(),
    });
    const first = table.getRowModel().rows[0]!;

    expect(first.getValue('value')).toBe(0);

    setTableOptions(table, {
      columns: [
        {
          accessorFn: (row) => row.value + 100,
          id: 'value',
        },
      ],
      data: data.slice(),
    });
    const second = table.getRowModel().rows[0]!;

    expect(second).not.toBe(first);
    expect(second.getValue('value')).toBe(100);
  });

  it('reuses nested rows recursively when parent, depth, index, and original stay stable', () => {
    const child: TreeNode = { id: 'child', value: 2 };
    const data: TreeNode[] = [{ children: [child], id: 'parent', value: 1 }];
    const table = makeTable({
      columns: [{ accessorKey: 'value' }],
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<TreeNode>(),
      getSubRows: (row) => row.children,
    });
    const first = table.getRowModel();
    const parentRow = first.rowsById['parent']!;
    const childRow = first.rowsById['child']!;

    setTableOptions(table, { data: data.slice() });
    const second = table.getRowModel();

    expect(second.rowsById['parent']).toBe(parentRow);
    expect(second.rowsById['child']).toBe(childRow);
    expect(second.rows[0]!.subRows[0]).toBe(childRow);
  });

  it('does not reuse a parent row when getSubRows returns a different child array for the same original', () => {
    const child: TreeNode = { id: 'child', value: 2 };
    const parent: TreeNode = { id: 'parent', value: 1 };
    const data = [parent];
    let children: TreeNode[] = [child];
    const getSubRows = (row: TreeNode) => (row.id === 'parent' ? children : undefined);
    const table = makeTable({
      columns: [{ accessorKey: 'value' }],
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<TreeNode>(),
      getSubRows,
    });
    const first = table.getRowModel();
    const parentRow = first.rowsById['parent']!;
    const childRow = first.rowsById['child']!;

    children = [];
    setTableOptions(table, { data: data.slice() });
    const second = table.getRowModel();

    expect(second.rowsById['parent']).not.toBe(parentRow);
    expect(second.rowsById['child']).toBeUndefined();
    expect(second.rowsById['parent']!.subRows).toEqual([]);
    expect(first.rowsById['child']).toBe(childRow);
  });

  it('does not reuse a nested row when it is reparented', () => {
    const child: TreeNode = { id: 'child', value: 2 };
    const data: TreeNode[] = [
      { children: [child], id: 'parent-a', value: 1 },
      { children: [], id: 'parent-b', value: 3 },
    ];
    const table = makeTable({
      columns: [{ accessorKey: 'value' }],
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<TreeNode>(),
      getSubRows: (row) => row.children,
    });
    const firstChild = table.getRowModel().rowsById['child']!;
    const reparented: TreeNode[] = [
      { children: [], id: 'parent-a', value: 1 },
      { children: [child], id: 'parent-b', value: 3 },
    ];

    setTableOptions(table, { data: reparented });
    const second = table.getRowModel();

    expect(second.rowsById['child']).not.toBe(firstChild);
    expect(second.rowsById['child']!.parentId).toBe('parent-b');
  });

  it('keeps row feature methods live against current table state when a row is reused', () => {
    const data = makePeople(1);
    const table = makeTable({
      columns: personColumns,
      data,
      getCoreRowModelFactory: experimental_getReusableCoreRowModel<Person>(),
      state: { rowSelection: { 'row-0': true } },
    });
    const row = table.getRowModel().rows[0]!;

    expect(row.getIsSelected()).toBe(true);

    setTableOptions(table, {
      data: data.slice(),
      state: { rowSelection: {} },
    });
    const reusedRow = table.getRowModel().rows[0]!;

    expect(reusedRow).toBe(row);
    expect(reusedRow.getIsSelected()).toBe(false);
  });
});
