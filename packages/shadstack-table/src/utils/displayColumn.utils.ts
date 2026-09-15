import {
  type SST_DefinedTableOptions,
  type SST_DisplayColumnIds,
  type SST_Localization,
  type SST_RowData,
  type SST_StatefulTableOptions,
  type SST_TableState,
} from '../types';
import { getAllLeafColumnDefs, getColumnId } from './column.utils';

type DisplayColumnOptions<TData extends SST_RowData> = Omit<
  SST_StatefulTableOptions<TData>,
  'state'
> & {
  state: Partial<SST_TableState<TData>>;
};

export function defaultDisplayColumnProps<TData extends SST_RowData>({
  header,
  id,
  size,
  tableOptions,
}: {
  header?: keyof SST_Localization;
  id: SST_DisplayColumnIds;
  size: number;
  tableOptions: SST_DefinedTableOptions<TData>;
}) {
  const { defaultDisplayColumn, displayColumnDefOptions, localization } = tableOptions;

  return {
    ...defaultDisplayColumn,
    header: header ? localization[header]! : '',
    size,
    ...displayColumnDefOptions?.[id],
    id,
  } as const;
}

export const showRowPinningColumn = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
): boolean => {
  const { enableRowPinning, rowPinningDisplayMode } = tableOptions;

  return !!(enableRowPinning && !rowPinningDisplayMode?.startsWith('select'));
};

export const showRowDragColumn = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
): boolean => {
  const { enableRowDragging, enableRowOrdering } = tableOptions;

  return !!(enableRowDragging || enableRowOrdering);
};

export const showRowExpandColumn = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
): boolean => {
  const {
    enableExpanding,
    enableGrouping,
    renderDetailPanel,
    state: { grouping },
  } = tableOptions;

  return !!(enableExpanding || (enableGrouping && grouping?.length) || renderDetailPanel);
};

export const showRowActionsColumn = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
): boolean => {
  const {
    createDisplayMode,
    editDisplayMode,
    enableEditing,
    enableRowActions,
    state: { creatingRow },
  } = tableOptions;

  return !!(
    enableRowActions ||
    (creatingRow && createDisplayMode === 'row') ||
    (enableEditing && ['modal', 'row'].includes(editDisplayMode ?? ''))
  );
};

export const showRowSelectionColumn = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
): boolean => !!tableOptions.enableRowSelection;

export const showRowNumbersColumn = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
): boolean => !!tableOptions.enableRowNumbers;

export const showRowSpacerColumn = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
): boolean => tableOptions.layoutMode === 'grid-no-grow';

export const getLeadingDisplayColumnIds = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
) =>
  (
    [
      showRowPinningColumn(tableOptions) && 'sst-row-pin',
      showRowDragColumn(tableOptions) && 'sst-row-drag',
      tableOptions.positionActionsColumn === 'first' &&
        showRowActionsColumn(tableOptions) &&
        'sst-row-actions',
      tableOptions.positionExpandColumn === 'first' &&
        showRowExpandColumn(tableOptions) &&
        'sst-row-expand',
      showRowSelectionColumn(tableOptions) && 'sst-row-select',
      showRowNumbersColumn(tableOptions) && 'sst-row-numbers',
    ] satisfies (SST_DisplayColumnIds | false)[]
  ).filter((id) => id !== false);

export const getTrailingDisplayColumnIds = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
) =>
  (
    [
      tableOptions.positionActionsColumn === 'last' &&
        showRowActionsColumn(tableOptions) &&
        'sst-row-actions',
      tableOptions.positionExpandColumn === 'last' &&
        showRowExpandColumn(tableOptions) &&
        'sst-row-expand',
      showRowSpacerColumn(tableOptions) && 'sst-row-spacer',
    ] satisfies (SST_DisplayColumnIds | false)[]
  ).filter((id) => id !== false);

export const getDefaultColumnOrderIds = <TData extends SST_RowData>(
  tableOptions: DisplayColumnOptions<TData>,
  reset = false,
) => {
  const {
    state: { columnOrder: currentColumnOrderIds = [] },
  } = tableOptions;

  const leadingDisplayColIds: string[] = getLeadingDisplayColumnIds(tableOptions);
  const trailingDisplayColIds: string[] = getTrailingDisplayColumnIds(tableOptions);

  const defaultColumnDefIds = getAllLeafColumnDefs(tableOptions.columns).map((columnDef) =>
    getColumnId(columnDef),
  );

  let allLeafColumnDefIds = reset
    ? defaultColumnDefIds
    : Array.from(new Set([...currentColumnOrderIds, ...defaultColumnDefIds]));

  allLeafColumnDefIds = allLeafColumnDefIds.filter(
    (colId) => !leadingDisplayColIds.includes(colId) && !trailingDisplayColIds.includes(colId),
  );

  return [...leadingDisplayColIds, ...allLeafColumnDefIds, ...trailingDisplayColIds];
};
