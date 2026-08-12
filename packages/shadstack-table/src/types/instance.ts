import { type Dispatch, type RefObject, type SetStateAction } from 'react';
import { type ReactTable } from '@tanstack/react-table';
import { type SST_Features } from '../features';
import { type SST_Cell } from './cell';
import { type SST_Column, type SST_Header, type SST_HeaderGroup } from './column';
import { type SST_ColumnFilterFnsState, type SST_FilterOption } from './fns';
import { type SST_DefinedTableOptions } from './options';
import { type SST_DensityState } from './primitives';
import { type SST_Row, type SST_RowData, type SST_RowModel } from './row';
import { type SST_TableState } from './state';

/**
 * Structural view of a TanStack Store readonly atom. Declared here rather than
 * imported from `@tanstack/store` so the package's public types do not depend
 * on a transitive package it never declares.
 */
export interface SST_StateAtom<TValue> {
  get: () => TValue;
  subscribe: (listener: (value: TValue) => void) => { unsubscribe: () => void };
}

export interface SST_WritableStateAtom<TValue> extends SST_StateAtom<TValue> {
  set: (updater: TValue | ((old: TValue) => TValue)) => void;
}

/**
 * One derived readonly atom per table state slice — TanStack's and
 * shadstack's alike, since `shadstackCoreFeature` registers the shadstack
 * slices as real table state. Each atom applies the
 * `options.atoms[key]` > `options.state[key]` > base-atom precedence, so
 * `get()` always returns the effective value. `get()` reads without
 * subscribing; `subscribe()` is notified per slice change.
 */
export type SST_StateAtoms<TData extends SST_RowData> = {
  [Key in keyof SST_TableState<TData>]-?: SST_StateAtom<SST_TableState<TData>[Key]>;
};

/** The internal writable atoms backing each uncontrolled slice. */
export type SST_StateBaseAtoms<TData extends SST_RowData> = {
  [Key in keyof SST_TableState<TData>]-?: SST_WritableStateAtom<SST_TableState<TData>[Key]>;
};

export type SST_TableInstance<TData extends SST_RowData> = Omit<
  ReactTable<SST_Features, TData>,
  | 'atoms'
  | 'baseAtoms'
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
  atoms: SST_StateAtoms<TData>;
  baseAtoms: SST_StateBaseAtoms<TData>;
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
  /**
   * The resolved table options. `options.state` holds only consumer-supplied
   * controlled state (the v9 contract) — read current state through
   * `getState()` or `atoms`, never through `options.state`.
   */
  options: SST_DefinedTableOptions<TData>;
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
