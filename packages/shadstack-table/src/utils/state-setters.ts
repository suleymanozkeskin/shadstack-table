import { type OnChangeFn, type Updater } from '@tanstack/react-table';
import {
  type SST_RowData,
  type SST_TableInstance,
  type SST_TableState,
  type SST_WritableStateAtom,
  type SST_DefinedTableOptions,
} from '../types';

type StateSetterName =
  | 'setActionCell'
  | 'setColumnFilterFns'
  | 'setCreatingRow'
  | 'setDensity'
  | 'setDraggingColumn'
  | 'setDraggingRow'
  | 'setEditingCell'
  | 'setEditingRow'
  | 'setGlobalFilterFn'
  | 'setHoveredColumn'
  | 'setHoveredRow'
  | 'setIsFullScreen'
  | 'setShowAlertBanner'
  | 'setShowColumnFilters'
  | 'setShowGlobalFilter'
  | 'setShowToolbarDropZone';

const createStateSetter =
  <TData extends SST_RowData, Key extends keyof SST_TableState<TData>>(
    readTable: () => SST_TableInstance<TData>,
    key: Key,
    readHandler: (
      options: SST_DefinedTableOptions<TData>,
    ) => OnChangeFn<SST_TableState<TData>[Key]> | undefined,
  ) =>
  (value: Updater<SST_TableState<TData>[Key]>): void => {
    const table = readTable();
    const handler = readHandler(table.options);

    if (handler) {
      handler(value);
    } else {
      const atom: SST_WritableStateAtom<SST_TableState<TData>[Key]> = table.baseAtoms[key];
      atom.set(value);
    }
  };

/** The reader must return the current table when a setter is called. */
export const createTableStateSetters = <TData extends SST_RowData>(
  readTable: () => SST_TableInstance<TData>,
): Pick<SST_TableInstance<TData>, StateSetterName> => ({
  setActionCell: createStateSetter(
    readTable,
    'actionCell',
    (options) => options.onActionCellChange,
  ),
  setColumnFilterFns: createStateSetter(
    readTable,
    'columnFilterFns',
    (options) => options.onColumnFilterFnsChange,
  ),
  setCreatingRow: createStateSetter(
    readTable,
    'creatingRow',
    (options) => options.onCreatingRowChange,
  ),
  setDensity: createStateSetter(readTable, 'density', (options) => options.onDensityChange),
  setDraggingColumn: createStateSetter(
    readTable,
    'draggingColumn',
    (options) => options.onDraggingColumnChange,
  ),
  setDraggingRow: createStateSetter(
    readTable,
    'draggingRow',
    (options) => options.onDraggingRowChange,
  ),
  setEditingCell: createStateSetter(
    readTable,
    'editingCell',
    (options) => options.onEditingCellChange,
  ),
  setEditingRow: createStateSetter(
    readTable,
    'editingRow',
    (options) => options.onEditingRowChange,
  ),
  setGlobalFilterFn: createStateSetter(
    readTable,
    'globalFilterFn',
    (options) => options.onGlobalFilterFnChange,
  ),
  setHoveredColumn: createStateSetter(
    readTable,
    'hoveredColumn',
    (options) => options.onHoveredColumnChange,
  ),
  setHoveredRow: createStateSetter(
    readTable,
    'hoveredRow',
    (options) => options.onHoveredRowChange,
  ),
  setIsFullScreen: createStateSetter(
    readTable,
    'isFullScreen',
    (options) => options.onIsFullScreenChange,
  ),
  setShowAlertBanner: createStateSetter(
    readTable,
    'showAlertBanner',
    (options) => options.onShowAlertBannerChange,
  ),
  setShowColumnFilters: createStateSetter(
    readTable,
    'showColumnFilters',
    (options) => options.onShowColumnFiltersChange,
  ),
  setShowGlobalFilter: createStateSetter(
    readTable,
    'showGlobalFilter',
    (options) => options.onShowGlobalFilterChange,
  ),
  setShowToolbarDropZone: createStateSetter(
    readTable,
    'showToolbarDropZone',
    (options) => options.onShowToolbarDropZoneChange,
  ),
});
