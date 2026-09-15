import {
  constructRow as _createRow,
  isFunction,
  type Table,
  type DeepKeys,
  type AccessorFn,
  type Row,
  flexRender as _flexRender,
} from '@tanstack/react-table';
import {
  type SST_ColumnHelper,
  type SST_AccessorValue,
  type SST_Row,
  type SST_RowData,
  type SST_TableInstance,
} from '../types';
import { type SST_Features } from '../features';

export const flexRender = _flexRender;

export function createSSTColumnHelper<TData extends SST_RowData>(): SST_ColumnHelper<TData> {
  return {
    accessor: (accessor, column) => {
      type TValue = SST_AccessorValue<TData, typeof accessor>;

      // SAFETY: The helper signature derives TValue from this accessor's return type.
      return isFunction(accessor)
        ? {
            ...column,
            accessorFn: accessor as AccessorFn<TData, TValue>,
          }
        : {
            ...column,
            // SAFETY: The non-function branch is constrained to DeepKeys<TData>.
            accessorKey: accessor as DeepKeys<TData>,
          };
    },
    display: (column) => column,
    group: (column) => column,
  };
}

/**
 * @deprecated Use `createSSTColumnHelper` instead. This MRT-era alias is kept
 * for migration compatibility and will be removed in a future major.
 */
export const createMRTColumnHelper = createSSTColumnHelper;

export const createRow = <TData extends SST_RowData>(
  table: SST_TableInstance<TData>,
  originalRow: TData,
  rowIndex = -1,
  depth = 0,
  subRows?: SST_Row<TData>[],
  parentId?: string,
): SST_Row<TData> =>
  // SAFETY: The facade wraps this TanStack table; construction preserves TData and row APIs.
  _createRow(
    table as Table<SST_Features, TData>,
    'sst-row-create',
    originalRow,
    rowIndex,
    depth,
    // SAFETY: These rows use the same features; their column definitions are prepared.
    subRows as Row<SST_Features, TData>[] | undefined,
    parentId,
  ) as SST_Row<TData>;

/**
 * Runs `fn` inside the table's reactivity batch, so multiple state-slice
 * writes produce a single store notification and no subscriber can observe a
 * half-applied combination. React already coalesces the re-renders; this
 * protects non-render subscribers (`table.Subscribe`, direct
 * `store.subscribe`) and skips redundant derived-atom recomputation.
 */
export const batchTableStateUpdates = <TData extends SST_RowData>(
  table: SST_TableInstance<TData>,
  fn: () => void,
): void => {
  // oxlint-disable-next-line no-underscore-dangle -- TanStack exposes batching through _reactivity.
  table._reactivity.batch(fn);
};
