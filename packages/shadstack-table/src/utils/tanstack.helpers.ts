import { type ReactNode, type JSX } from 'react';
import {
  constructRow as _createRow,
  flexRender as _flexRender,
  type Renderable,
} from '@tanstack/react-table';
import {
  type SST_ColumnHelper,
  type SST_DisplayColumnDef,
  type SST_GroupColumnDef,
  type SST_Row,
  type SST_RowData,
  type SST_TableInstance,
} from '../types';
import { getAllLeafColumnDefs, getColumnId } from './column.utils';

export const flexRender = _flexRender as (
  Comp: Renderable<any>,
  props: any,
) => JSX.Element | ReactNode;

export function createSSTColumnHelper<TData extends SST_RowData>(): SST_ColumnHelper<TData> {
  return {
    accessor: (accessor, column) => {
      return typeof accessor === 'function'
        ? ({
            ...column,
            accessorFn: accessor,
          } as any)
        : {
            ...column,
            accessorKey: accessor,
          };
    },
    display: (column) => column as SST_DisplayColumnDef<TData>,
    group: (column) => column as SST_GroupColumnDef<TData>,
  };
}

/**
 * @deprecated Use `createSSTColumnHelper` instead. This MRT-era alias is kept
 * for migration compatibility and will be removed in a future major.
 */
export const createMRTColumnHelper = createSSTColumnHelper;

export const createRow = <TData extends SST_RowData>(
  table: SST_TableInstance<TData>,
  originalRow?: TData,
  rowIndex = -1,
  depth = 0,
  subRows?: SST_Row<TData>[],
  parentId?: string,
): SST_Row<TData> =>
  _createRow(
    table as any,
    'sst-row-create',
    originalRow ??
      Object.assign(
        {},
        ...getAllLeafColumnDefs(table.options.columns).map((col) => ({
          [getColumnId(col)]: '',
        })),
      ),
    rowIndex,
    depth,
    subRows as any,
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
  const reactivity = (table as unknown as { _reactivity?: { batch?: (fn: () => void) => void } })
    // oxlint-disable-next-line no-underscore-dangle -- `_reactivity` is the table-core reactivity-bindings slot; there is no public accessor for `batch`
    ._reactivity;
  (reactivity?.batch ?? ((run: () => void) => run()))(fn);
};
