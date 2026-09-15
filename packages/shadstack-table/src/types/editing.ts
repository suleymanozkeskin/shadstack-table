import { type SST_Row, type SST_RowData } from './row';

/** Text from built-in editors, keyed by column ID. Parse it before saving application data. */
export type SST_EditValues = Readonly<Partial<Record<string, string>>>;

export type SST_EditingApi<TData extends SST_RowData> = {
  /** Returns current text for data columns without changing the row. */
  getEditValues: (row: SST_Row<TData>) => SST_EditValues;
  /** Returns an edited value, or undefined when that column has no draft. */
  getEditedValue: (row: SST_Row<TData>, columnId: string) => string | undefined;
  /** Stores editor text. The original row and accessor cache stay unchanged. */
  setEditValue: (row: SST_Row<TData>, columnId: string, value: string) => void;
  /** Removes this row's text drafts. */
  clearEditValues: (row: SST_Row<TData>) => void;
};
