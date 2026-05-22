import { type TableState } from '@tanstack/react-table';
import { type SST_Cell } from './cell';
import { type SST_Column } from './column';
import { type SST_ColumnFilterFnsState, type SST_FilterOption } from './fns';
import { type SST_DensityState } from './primitives';
import { type SST_Row, type SST_RowData } from './row';

export interface SST_TableState<TData extends SST_RowData> extends TableState {
  actionCell?: SST_Cell<TData> | null;
  columnFilterFns: SST_ColumnFilterFnsState;
  creatingRow: SST_Row<TData> | null;
  density: SST_DensityState;
  draggingColumn: SST_Column<TData> | null;
  draggingRow: SST_Row<TData> | null;
  editingCell: SST_Cell<TData> | null;
  editingRow: SST_Row<TData> | null;
  globalFilterFn: SST_FilterOption;
  hoveredColumn: Partial<SST_Column<TData>> | null;
  hoveredRow: Partial<SST_Row<TData>> | null;
  isFullScreen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  showAlertBanner: boolean;
  showColumnFilters: boolean;
  showGlobalFilter: boolean;
  showLoadingOverlay: boolean;
  showProgressBars: boolean;
  showSkeletons: boolean;
  showToolbarDropZone: boolean;
}
