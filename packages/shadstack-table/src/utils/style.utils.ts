import { type CSSProperties } from 'react';
import {
  type SST_Column,
  type SST_Header,
  type SST_RowData,
  type SST_TableInstance,
  type SST_TableOptions,
  type SST_Theme,
} from '../types';
import { parseFromValuesOrFunc } from './utils';

// TODO: theme-aware styling moved to CSS vars in _ui/styles.css.
// MUI's Theme / alpha / darken / lighten / palette have no direct equivalent
// here; we resolve everything through `var(--<token>)` (light/dark are handled
// by the `.dark` class flipping the CSS vars).

type CommonTableCellProps = {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify' | 'char';
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- slot passthrough may forward sx-style objects from consumers
  sx?: any;
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- generic React cell prop bag for slot passthrough
  [key: string]: any;
};

export const parseCSSVarId = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '_');

export const getMRTTheme = <TData extends SST_RowData>(
  mrtTheme: SST_TableOptions<TData>['mrtTheme'],
): SST_Theme => {
  const mrtThemeOverrides = parseFromValuesOrFunc(mrtTheme, undefined);
  const baseBackgroundColor = mrtThemeOverrides?.baseBackgroundColor ?? 'var(--background)';
  return {
    baseBackgroundColor,
    cellNavigationOutlineColor: 'var(--ring)',
    draggingBorderColor: 'var(--primary)',
    matchHighlightColor: 'color-mix(in oklch, var(--chart-4) 60%, var(--background))',
    menuBackgroundColor: 'var(--popover)',
    pinnedRowBackgroundColor: 'color-mix(in oklch, var(--accent) 60%, transparent)',
    selectedRowBackgroundColor: 'var(--muted)',
    ...mrtThemeOverrides,
  };
};

export const commonCellBeforeAfterStyles: CSSProperties = {
  content: '""',
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: -1,
};

/**
 * @deprecated Returns an empty object. Pinned-cell visual differentiation is
 * deliberately not rendered (see 0.1.4 — the 0.1.3 overlay restoration was
 * reverted because it diverged from the v0.1.1 look consumers expected).
 *
 * The original implementation returned a nested `&[data-pinned="true"] &:before`
 * sx-style object that was spread into React's inline `style={…}`. React inline
 * styles support neither nested selectors nor pseudo-elements, so the result
 * was silently dropped and produced a console warning for every pinned cell.
 *
 * The export is preserved at empty for API compatibility. Consumers who want
 * pinned columns to be visually distinct can add a CSS rule keyed off the
 * `[data-pinned]` attribute that the head/body/footer cells emit.
 */
export const getCommonPinnedCellStyles = <TData extends SST_RowData>(_args: {
  column?: SST_Column<TData>;
  table: SST_TableInstance<TData>;
}): Record<string, Record<string, unknown>> => ({});

export const getCommonMRTCellStyles = <TData extends SST_RowData>({
  column,
  header,
  table,
  tableCellProps,
}: {
  column: SST_Column<TData>;
  header?: SST_Header<TData>;
  table: SST_TableInstance<TData>;
  tableCellProps: CommonTableCellProps;
}) => {
  const {
    getState,
    options: { enableColumnVirtualization, layoutMode },
  } = table;
  const { draggingColumn } = getState();
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const isColumnPinned = columnDef.columnDefType !== 'group' && column.getIsPinned();

  const widthStyles: CSSProperties = {
    minWidth: `max(calc(var(--${header ? 'header' : 'col'}-${parseCSSVarId(
      header?.id ?? column.id,
    )}-size) * 1px), ${columnDef.minSize ?? 30}px)`,
    width: `calc(var(--${header ? 'header' : 'col'}-${parseCSSVarId(
      header?.id ?? column.id,
    )}-size) * 1px)`,
  };

  if (layoutMode === 'grid') {
    widthStyles.flex = `${
      [0, false].includes(columnDef.grow!)
        ? 0
        : `var(--${header ? 'header' : 'col'}-${parseCSSVarId(header?.id ?? column.id)}-size)`
    } 0 auto`;
  } else if (layoutMode === 'grid-no-grow') {
    widthStyles.flex = `${+(columnDef.grow || 0)} 0 auto`;
  }

  const pinnedStyles = isColumnPinned
    ? {
        ...getCommonPinnedCellStyles({ column, table }),
        left: isColumnPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        position: 'sticky',
        right: isColumnPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      }
    : {};

  // Focus-visible ring is applied via stylesheet (see _ui/styles.css) reading
  // `--sst-cell-outline-color`. The variable is set once on the table container
  // (SST_TableContainer) from `mrtTheme.cellNavigationOutlineColor`, so it can
  // stay themable without us emitting a nested `&:focus-visible` selector into
  // React inline style (which React warns about and silently drops).
  return {
    backgroundColor: 'inherit',
    backgroundImage: 'inherit',
    display: layoutMode?.startsWith('grid') ? 'flex' : undefined,
    justifyContent:
      columnDefType === 'group'
        ? 'center'
        : layoutMode?.startsWith('grid')
          ? tableCellProps.align
          : undefined,
    opacity:
      table.getState().draggingColumn?.id === column.id ||
      table.getState().hoveredColumn?.id === column.id
        ? 0.5
        : 1,
    position: 'relative',
    transition: enableColumnVirtualization ? 'none' : 'padding 150ms ease-in-out',
    zIndex:
      column.getIsResizing() || draggingColumn?.id === column.id
        ? 2
        : columnDefType !== 'group' && isColumnPinned
          ? 1
          : 0,
    ...pinnedStyles,
    ...widthStyles,
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- legacy MUI sx passthrough
    ...(parseFromValuesOrFunc(tableCellProps?.sx, undefined) as any),
  };
};

export const getCommonToolbarStyles = <TData extends SST_RowData>({
  table,
}: {
  table: SST_TableInstance<TData>;
}) => ({
  alignItems: 'flex-start',
  backgroundColor: table.options.mrtTheme.baseBackgroundColor,
  display: 'grid',
  flexWrap: 'wrap-reverse',
  minHeight: '3.5rem',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 150ms ease-in-out',
  zIndex: 1,
});

export const flipIconStyles = (direction?: 'ltr' | 'rtl') =>
  direction === 'rtl' ? { style: { transform: 'scaleX(-1)' } } : undefined;

// shadcn Tooltip's surface differs from MUI's — we expose just the side
// (placement) and a generous delay. Consumers pass these straight to
// `<TooltipProvider delayDuration>` and `<TooltipContent side>`.
export const getCommonTooltipProps = (placement?: 'top' | 'right' | 'bottom' | 'left') => ({
  side: placement,
  delayDuration: 1000,
});
