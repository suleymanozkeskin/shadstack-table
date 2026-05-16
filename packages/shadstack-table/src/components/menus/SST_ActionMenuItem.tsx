// oxlint-disable jsx-a11y/click-events-have-key-events -- verbatim port of upstream MRT
// oxlint-disable jsx-a11y/prefer-tag-over-role -- verbatim port of upstream MRT
import * as React from 'react';
import { type MouseEvent, type ReactNode } from 'react';
import { Separator } from '../../_ui/separator';
import { cn } from '../../lib/utils';
import { type SST_RowData, type SST_TableInstance } from '../../types';

export interface SST_ActionMenuItemProps<
  TData extends SST_RowData,
> extends React.ComponentProps<'button'> {
  divider?: boolean;
  icon: ReactNode;
  label: string;
  onOpenSubMenu?: (event: MouseEvent<HTMLElement>) => void;
  selected?: boolean;
  table: SST_TableInstance<TData>;
  value?: string;
}

export const SST_ActionMenuItem = <TData extends SST_RowData>({
  className,
  divider,
  icon,
  label,
  onOpenSubMenu,
  selected,
  table,
  ...rest
}: SST_ActionMenuItemProps<TData>) => {
  const {
    options: {
      icons: { ArrowRightIcon },
    },
  } = table;

  return (
    <>
      <button
        type="button"
        tabIndex={0}
        {...rest}
        className={cn(
          'relative flex w-full min-w-[120px] cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
          selected && 'bg-accent text-accent-foreground',
          className,
        )}
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
            {icon}
          </span>
          {label}
        </span>
        {onOpenSubMenu && (
          <span
            role="button"
            tabIndex={-1}
            onClick={onOpenSubMenu}
            onMouseEnter={onOpenSubMenu}
            className="inline-flex h-5 w-5 items-center justify-center p-0"
          >
            <ArrowRightIcon />
          </span>
        )}
      </button>
      {divider && <Separator className="my-1" />}
    </>
  );
};
