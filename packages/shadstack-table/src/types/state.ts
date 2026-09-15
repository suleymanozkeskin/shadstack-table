import { type TableState } from '@tanstack/react-table';
import { type SST_Features } from '../features';
import { type SST_Cell } from './cell';
import { type SST_Column } from './column';
import { type SST_ColumnFilterFnsState, type SST_FilterOption } from './fns';
import { type SST_DensityState } from './primitives';
import { type SST_Row, type SST_RowData } from './row';

export type SST_HoveredColumn<TData extends SST_RowData> =
  | Readonly<{ kind: 'column'; column: SST_Column<TData> }>
  | Readonly<{ kind: 'drop-zone' }>
  | null;

export interface SST_TableState<TData extends SST_RowData> extends TableState<SST_Features> {
  actionCell: SST_Cell<TData> | null;
  columnFilterFns: SST_ColumnFilterFnsState;
  creatingRow: SST_Row<TData> | null;
  density: SST_DensityState;
  draggingColumn: SST_Column<TData> | null;
  draggingRow: SST_Row<TData> | null;
  editingCell: SST_Cell<TData> | null;
  editingRow: SST_Row<TData> | null;
  globalFilterFn: SST_FilterOption;
  hoveredColumn: SST_HoveredColumn<TData>;
  hoveredRow: SST_Row<TData> | null;
  isFullScreen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  showAlertBanner: boolean;
  showColumnFilters: boolean;
  showGlobalFilter: boolean;
  showLoadingOverlay: boolean | undefined;
  showProgressBars: boolean | undefined;
  showSkeletons: boolean | undefined;
  showToolbarDropZone: boolean;
}
