import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { useShadStackTable } from '../hooks/useShadStackTable';
import { type SST_TableInstance, type SST_TableOptions } from '../types';
import { people, personColumns, type Person } from './fixtures';

// These tests pin the render-granularity contract, not just correctness: a
// state write re-renders only the components whose subscription selects it.
// Slot-prop functions run once per host-component render, so their invocation
// counts are exact render counters for internal components without any
// test-only instrumentation.

let capturedTable: SST_TableInstance<Person>;
let harnessRenders = 0;

const makeCounters = () => {
  const rowRenders = new Map<string, number>();
  const cellRenders = new Map<string, number>();
  const headCellRenders = new Map<string, number>();
  const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);
  const slotProps: SST_TableOptions<Person>['slotProps'] = {
    tableBodyCell: ({ cell }) => {
      bump(cellRenders, cell.id);
      return {};
    },
    tableBodyRow: ({ row }) => {
      bump(rowRenders, row.id);
      return {};
    },
    tableHeadCell: ({ column }) => {
      bump(headCellRenders, column.id);
      return {};
    },
  };
  const snapshot = (map: Map<string, number>) => new Map(map);
  const delta = (map: Map<string, number>, before: Map<string, number>, key: string) =>
    (map.get(key) ?? 0) - (before.get(key) ?? 0);
  return { cellRenders, delta, headCellRenders, rowRenders, slotProps, snapshot };
};

const Harness = (options: Partial<SST_TableOptions<Person>>) => {
  harnessRenders++;
  const table = useShadStackTable<Person>({
    columns: personColumns,
    data: people,
    ...options,
  });
  capturedTable = table;
  return <ShadStackTable table={table} />;
};

describe('render granularity — writes reach only their subscribers', () => {
  it('hovering a row during a drag re-renders that row alone', () => {
    const c = makeCounters();
    render(<Harness enableRowOrdering slotProps={c.slotProps} />);
    const rows = capturedTable.getRowModel().rows;

    //drag start legitimately re-renders every row (the drag-enter handlers arm)
    act(() => capturedTable.setDraggingRow(rows[0]!));
    const before = c.snapshot(c.rowRenders);

    act(() => capturedTable.setHoveredRow(rows[2]!));

    expect(c.delta(c.rowRenders, before, rows[2]!.id)).toBe(1);
    for (const row of rows) {
      if (row.id === rows[2]!.id) continue;
      expect(
        c.delta(c.rowRenders, before, row.id),
        `row ${row.id} re-rendered on another row's hover`,
      ).toBe(0);
    }
  });

  it('starting a cell edit re-renders that cell alone — no rows, no other cells', () => {
    const c = makeCounters();
    render(<Harness enableEditing editDisplayMode="cell" slotProps={c.slotProps} />);
    const rows = capturedTable.getRowModel().rows;
    const targetCell = rows[1]!.getAllCells().find((cell) => cell.column.id === 'firstName')!;

    const beforeCells = c.snapshot(c.cellRenders);
    const beforeRows = c.snapshot(c.rowRenders);

    act(() => capturedTable.setEditingCell(targetCell));

    expect(c.delta(c.cellRenders, beforeCells, targetCell.id)).toBe(1);
    for (const [cellId] of c.cellRenders) {
      if (cellId === targetCell.id) continue;
      expect(
        c.delta(c.cellRenders, beforeCells, cellId),
        `cell ${cellId} re-rendered on another cell's edit`,
      ).toBe(0);
    }
    for (const [rowId] of c.rowRenders) {
      expect(c.delta(c.rowRenders, beforeRows, rowId), `row ${rowId} re-rendered on edit`).toBe(0);
    }
  });

  it('changing page leaves every header cell un-rendered', () => {
    const c = makeCounters();
    render(
      <Harness
        initialState={{ pagination: { pageIndex: 0, pageSize: 2 } }}
        slotProps={c.slotProps}
      />,
    );
    const beforeHead = c.snapshot(c.headCellRenders);
    const beforeRows = c.snapshot(c.rowRenders);

    act(() => capturedTable.setPageIndex(1));

    for (const [columnId] of c.headCellRenders) {
      expect(
        c.delta(c.headCellRenders, beforeHead, columnId),
        `head cell ${columnId} re-rendered on page change`,
      ).toBe(0);
    }
    //the body really did re-render with the next page's rows
    const rowDeltas = [...c.rowRenders.keys()].map((rowId) =>
      c.delta(c.rowRenders, beforeRows, rowId),
    );
    expect(rowDeltas.some((rowDelta) => rowDelta > 0)).toBe(true);
    expect(capturedTable.getState().pagination.pageIndex).toBe(1);
  });

  it('the hook host stays quiet for hover, selection, and pagination writes', () => {
    render(<Harness />);
    const rows = capturedTable.getRowModel().rows;
    const before = harnessRenders;

    act(() => capturedTable.setHoveredRow(rows[1]!));
    act(() => rows[0]!.toggleSelected(true));
    act(() => capturedTable.setPageIndex(0));
    act(() => capturedTable.setDensity('compact'));

    expect(harnessRenders).toBe(before);

    //grouping IS host-selected (display columns depend on it) — sanity-check
    //the counter still moves at all
    act(() => capturedTable.setGrouping(['firstName']));
    expect(harnessRenders).toBeGreaterThan(before);
  });
});
