import { type Dispatch, type RefObject, type SetStateAction } from 'react';
import { type ReactTable } from '@tanstack/react-table';
import { type SST_Features } from '../features';
import { type SST_Cell } from './cell';
import { type SST_Column, type SST_Header, type SST_HeaderGroup } from './column';
import { type SST_ColumnFilterFnsState, type SST_FilterOption } from './fns';
import { type SST_StatefulTableOptions } from './options';
import { type SST_DensityState } from './primitives';
import { type SST_Row, type SST_RowData, type SST_RowModel } from './row';
import { type SST_TableState } from './state';

export type SST_TableInstance<TData extends SST_RowData> = Omit<
  ReactTable<SST_Features, TData>,
  | 'getAllColumns'
  | 'getAllFlatColumns'
  | 'getAllLeafColumns'
  | 'getBottomRows'
  | 'getCenterLeafColumns'
  | 'getCenterRows'
  | 'getColumn'
  | 'getEndLeafColumns'
  | 'getExpandedRowModel'
  | 'getFlatHeaders'
  | 'getFooterGroups'
  | 'getHeaderGroups'
  | 'getLeafHeaders'
  | 'getPaginatedRowModel'
  | 'getPreFilteredRowModel'
  | 'getPrePaginatedRowModel'
  | 'getRowModel'
  | 'getSelectedRowModel'
  | 'getStartLeafColumns'
  | 'getState'
  | 'getTopRows'
  | 'options'
> & {
  getAllColumns: () => SST_Column<TData>[];
  getAllFlatColumns: () => SST_Column<TData>[];
  getAllLeafColumns: () => SST_Column<TData>[];
  getBottomRows: () => SST_Row<TData>[];
  getCenterLeafColumns: () => SST_Column<TData>[];
  getCenterRows: () => SST_Row<TData>[];
  getColumn: (columnId: string) => SST_Column<TData>;
  getExpandedRowModel: () => SST_RowModel<TData>;
  getFlatHeaders: () => SST_Header<TData>[];
  getFooterGroups: () => SST_HeaderGroup<TData>[];
  getHeaderGroups: () => SST_HeaderGroup<TData>[];
  getEndLeafColumns: () => SST_Column<TData>[];
  getLeafHeaders: () => SST_Header<TData>[];
  getPaginatedRowModel: () => SST_RowModel<TData>;
  getPreFilteredRowModel: () => SST_RowModel<TData>;
  getPrePaginatedRowModel: () => SST_RowModel<TData>;
  getRowModel: () => SST_RowModel<TData>;
  getSelectedRowModel: () => SST_RowModel<TData>;
  getStartLeafColumns: () => SST_Column<TData>[];
  getState: () => SST_TableState<TData>;
  getTopRows: () => SST_Row<TData>[];
  options: SST_StatefulTableOptions<TData>;
  refs: {
    actionCellRef: RefObject<HTMLTableCellElement | null>;
    bottomToolbarRef: RefObject<HTMLDivElement | null>;
    editInputRefs: RefObject<Record<string, HTMLInputElement> | null>;
    filterInputRefs: RefObject<Record<string, HTMLInputElement> | null>;
    lastSelectedRowId: RefObject<null | string>;
    searchInputRef: RefObject<HTMLInputElement | null>;
    tableContainerRef: RefObject<HTMLDivElement | null>;
    tableFooterRef: RefObject<HTMLTableSectionElement | null>;
    tableHeadCellRefs: RefObject<Record<string, HTMLTableCellElement> | null>;
    tableHeadRef: RefObject<HTMLTableSectionElement | null>;
    tablePaperRef: RefObject<HTMLDivElement | null>;
    topToolbarRef: RefObject<HTMLDivElement | null>;
  };
  setActionCell: Dispatch<SetStateAction<SST_Cell<TData> | null>>;
  setColumnFilterFns: Dispatch<SetStateAction<SST_ColumnFilterFnsState>>;
  setCreatingRow: Dispatch<SetStateAction<SST_Row<TData> | null | true>>;
  setDensity: Dispatch<SetStateAction<SST_DensityState>>;
  setDraggingColumn: Dispatch<SetStateAction<SST_Column<TData> | null>>;
  setDraggingRow: Dispatch<SetStateAction<SST_Row<TData> | null>>;
  setEditingCell: Dispatch<SetStateAction<SST_Cell<TData> | null>>;
  setEditingRow: Dispatch<SetStateAction<SST_Row<TData> | null>>;
  setGlobalFilterFn: Dispatch<SetStateAction<SST_FilterOption>>;
  setHoveredColumn: Dispatch<SetStateAction<Partial<SST_Column<TData>> | null>>;
  setHoveredRow: Dispatch<SetStateAction<Partial<SST_Row<TData>> | null>>;
  setIsFullScreen: Dispatch<SetStateAction<boolean>>;
  setShowAlertBanner: Dispatch<SetStateAction<boolean>>;
  setShowColumnFilters: Dispatch<SetStateAction<boolean>>;
  setShowGlobalFilter: Dispatch<SetStateAction<boolean>>;
  setShowToolbarDropZone: Dispatch<SetStateAction<boolean>>;
};
