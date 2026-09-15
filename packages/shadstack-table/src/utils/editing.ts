import { type SST_EditingApi, type SST_Row, type SST_RowData } from '../types';

/** Creates draft storage owned by one table. Entries expire with their row objects. */
export const createEditingApi = <TData extends SST_RowData>(): SST_EditingApi<TData> => {
  const drafts = new WeakMap<SST_Row<TData>, Map<string, string>>();

  return {
    getEditValues: (row) => {
      const values: Record<string, string> = {};
      const edited = drafts.get(row);

      for (const cell of row.getAllCells()) {
        if (cell.column.columnDef.columnDefType !== 'data') continue;
        values[cell.column.id] = edited?.get(cell.column.id) ?? String(cell.getValue() ?? '');
      }

      return Object.freeze(values);
    },
    getEditedValue: (row, columnId) => drafts.get(row)?.get(columnId),
    setEditValue: (row, columnId, value) => {
      const values = drafts.get(row) ?? new Map<string, string>();
      values.set(columnId, value);
      drafts.set(row, values);
    },
    clearEditValues: (row) => {
      drafts.delete(row);
    },
  };
};
