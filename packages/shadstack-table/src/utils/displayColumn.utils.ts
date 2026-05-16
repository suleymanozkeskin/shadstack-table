import {
  type SST_DefinedTableOptions,
  type SST_DisplayColumnIds,
  type SST_Localization,
  type SST_RowData,
  type SST_StatefulTableOptions,
} from '../types';
import { getAllLeafColumnDefs, getColumnId } from './column.utils';

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
  tableOptions: SST_StatefulTableOptions<TData>,
): boolean => {
  const { enableRowPinning, rowPinningDisplayMode } = tableOptions;
  return !!(enableRowPinning && !rowPinningDisplayMode?.startsWith('select'));
};

export const showRowDragColumn = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): boolean => {
  const { enableRowDragging, enableRowOrdering } = tableOptions;
  return !!(enableRowDragging || enableRowOrdering);
};

export const showRowExpandColumn = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
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
  tableOptions: SST_StatefulTableOptions<TData>,
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
  tableOptions: SST_StatefulTableOptions<TData>,
): boolean => !!tableOptions.enableRowSelection;

export const showRowNumbersColumn = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): boolean => !!tableOptions.enableRowNumbers;

export const showRowSpacerColumn = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
): boolean => tableOptions.layoutMode === 'grid-no-grow';

export const getLeadingDisplayColumnIds = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
) =>
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
  ].filter(Boolean) as SST_DisplayColumnIds[];

export const getTrailingDisplayColumnIds = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
) =>
  [
    tableOptions.positionActionsColumn === 'last' &&
      showRowActionsColumn(tableOptions) &&
      'sst-row-actions',
    tableOptions.positionExpandColumn === 'last' &&
      showRowExpandColumn(tableOptions) &&
      'sst-row-expand',
    showRowSpacerColumn(tableOptions) && 'sst-row-spacer',
  ].filter(Boolean) as SST_DisplayColumnIds[];

export const getDefaultColumnOrderIds = <TData extends SST_RowData>(
  tableOptions: SST_StatefulTableOptions<TData>,
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
