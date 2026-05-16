import { type CSSProperties } from 'react';
import {
  type MRT_Column,
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TableOptions,
  type MRT_Theme,
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

export const getMRTTheme = <TData extends MRT_RowData>(
  mrtTheme: MRT_TableOptions<TData>['mrtTheme'],
): MRT_Theme => {
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

export const getCommonPinnedCellStyles = <TData extends MRT_RowData>({
  column,
  table,
}: {
  column?: MRT_Column<TData>;
  table: MRT_TableInstance<TData>;
}): Record<string, Record<string, unknown>> => {
  const { baseBackgroundColor } = table.options.mrtTheme;
  const isPinned = column?.getIsPinned();

  return {
    '&[data-pinned="true"]': {
      '&:before': {
        backgroundColor: `color-mix(in oklch, ${baseBackgroundColor} 97%, black)`,
        boxShadow: column
          ? isPinned === 'left' && column.getIsLastColumn(isPinned)
            ? '-4px 0 4px -4px color-mix(in oklch, var(--foreground) 50%, transparent) inset'
            : isPinned === 'right' && column.getIsFirstColumn(isPinned)
              ? '4px 0 4px -4px color-mix(in oklch, var(--foreground) 50%, transparent) inset'
              : undefined
          : undefined,
        ...commonCellBeforeAfterStyles,
      },
    },
  };
};

export const getCommonMRTCellStyles = <TData extends MRT_RowData>({
  column,
  header,
  table,
  tableCellProps,
}: {
  column: MRT_Column<TData>;
  header?: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
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
    '&:focus-visible': {
      outline: `2px solid ${table.options.mrtTheme.cellNavigationOutlineColor}`,
      outlineOffset: '-2px',
    },
    ...pinnedStyles,
    ...widthStyles,
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- legacy MUI sx passthrough
    ...(parseFromValuesOrFunc(tableCellProps?.sx, undefined) as any),
  };
};

export const getCommonToolbarStyles = <TData extends MRT_RowData>({
  table,
}: {
  table: MRT_TableInstance<TData>;
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
