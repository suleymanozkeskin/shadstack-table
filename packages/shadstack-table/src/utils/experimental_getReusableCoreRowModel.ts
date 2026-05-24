import {
  createRow,
  type Row,
  type RowData,
  type RowModel,
  type Table,
} from '@tanstack/react-table';

type ReuseEntry<TData extends RowData> = {
  depth: number;
  original: TData;
  originalSubRows: TData[] | undefined;
  parentId: string | undefined;
  row: Row<TData>;
  rowIndex: number;
};

/**
 * Experimental opt-in core row model that preserves `Row` (and downstream
 * `Cell`) instance identity across `data` ticks when the underlying row
 * payload is referentially stable.
 *
 * Drop-in replacement for `getCoreRowModel()` at the same slot:
 *
 *     const table = useReactTable({
 *       data,
 *       columns,
 *       getRowId: (row) => row.id, // required
 *       getCoreRowModel: experimental_getReusableCoreRowModel(),
 *     })
 *
 * Default behavior unchanged — this is purely additive. Use only when the
 * contract below holds; otherwise prefer the stock `getCoreRowModel()`.
 *
 * ## Contract
 *
 * A `Row` is reused across renders when **all** of the following match the
 * prior render's value at the same tree location:
 *   - `getRowId(original)` is stable
 *   - `original` is referentially equal (`===`)
 *   - `getSubRows?.(original)` is referentially equal
 *   - `rowIndex`, `parentId`, and `depth` are unchanged
 *
 * The contract caller must uphold: **same `original` reference ⇒ same
 * accessor-visible values.** Reusing a `Row` preserves its `_valuesCache` /
 * `_uniqueValuesCache` — if accessors are impure or the underlying row is
 * mutated in place, reuse will preserve stale values.
 *
 * ## Cache invalidation
 *
 * The reuse map is reset whenever `table.options.columns` changes reference.
 * That covers the column-accessor hazard: any inline column-def recreation
 * forces a fresh `_valuesCache` and prevents stale-value reads.
 *
 * ## When to use
 *
 * High-frequency immutable streaming data with structural sharing — orderbooks,
 * market data, logs, telemetry, monitoring tables — where most row objects in
 * a new `data` array are referentially equal to the prior tick's.
 *
 * ## When NOT to use
 *
 * - In-place mutation of `row.original`
 * - Impure accessors (depend on time, globals, random, mutable external state)
 * - Recreating all row objects every tick (`data.map(row => ({...row}))`)
 * - Unstable / missing `getRowId`
 *
 * ## Status
 *
 * Experimental. The `experimental_` prefix signals this API may change or be
 * removed before becoming stable. We expect to track upstream TanStack's
 * eventual answer; consumers should pin shadstack versions while this remains
 * experimental.
 */
export function experimental_getReusableCoreRowModel<TData extends RowData>(): (
  table: Table<TData>,
) => () => RowModel<TData> {
  return (table) => {
    let previousColumns = table.options.columns;
    let previousData: TData[] | undefined;
    let previousModel: RowModel<TData> | undefined;
    let previousRowsById = new Map<string, ReuseEntry<TData>>();

    return () => {
      const data = table.options.data;
      const interpretationChanged = previousColumns !== table.options.columns;

      if (!interpretationChanged && data === previousData && previousModel) {
        return previousModel;
      }

      if (interpretationChanged) {
        previousRowsById = new Map();
      }

      const nextRowsById = new Map<string, ReuseEntry<TData>>();
      const rowModel: RowModel<TData> = {
        flatRows: [],
        rows: [],
        rowsById: {},
      };

      const accessRows = (
        originalRows: TData[],
        depth = 0,
        parentRow?: Row<TData>,
      ): Row<TData>[] => {
        const rows: Row<TData>[] = [];

        for (let i = 0; i < originalRows.length; i++) {
          const original = originalRows[i]!;
          // oxlint-disable-next-line no-underscore-dangle -- mirrors TanStack core's internal row-id resolver path
          const id = table._getRowId(original, i, parentRow);
          const parentId = parentRow?.id;
          const originalSubRows = table.options.getSubRows?.(original, i);
          const previous = previousRowsById.get(id);
          let row: Row<TData>;

          if (
            previous &&
            previous.original === original &&
            previous.originalSubRows === originalSubRows &&
            previous.rowIndex === i &&
            previous.parentId === parentId &&
            previous.depth === depth
          ) {
            row = previous.row;
          } else {
            row = createRow(table, id, original, i, depth, undefined, parentId);
          }

          rowModel.flatRows.push(row);
          rowModel.rowsById[row.id] = row;
          rows.push(row);

          if (table.options.getSubRows) {
            row.originalSubRows = originalSubRows;
            if (row.originalSubRows?.length) {
              row.subRows = accessRows(row.originalSubRows, depth + 1, row);
            } else {
              row.subRows = [];
            }
          }

          nextRowsById.set(id, {
            depth,
            original,
            originalSubRows,
            parentId,
            row,
            rowIndex: i,
          });
        }

        return rows;
      };

      rowModel.rows = accessRows(data);

      previousColumns = table.options.columns;
      previousData = data;
      previousModel = rowModel;
      previousRowsById = nextRowsById;

      return rowModel;
    };
  };
}
