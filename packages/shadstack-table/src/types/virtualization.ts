import { type VirtualItem, type Virtualizer } from '@tanstack/react-virtual';

export type SST_VirtualItem = Readonly<VirtualItem>;

/** Geometry reads use an immutable snapshot. Measurement and scrolling methods act on the live core. */
export type SST_Virtualizer<TScroll extends Element | Window, TItem extends Element> = Readonly<
  Pick<
    Virtualizer<TScroll, TItem>,
    'measure' | 'measureElement' | 'resizeItem' | 'scrollBy' | 'scrollToIndex' | 'scrollToOffset'
  > & {
    getVirtualItems: () => readonly SST_VirtualItem[];
    getTotalSize: () => number;
  }
>;

export type SST_ColumnVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableCellElement,
> = SST_Virtualizer<TScrollElement, TItemElement> &
  Readonly<{
    virtualColumns: readonly SST_VirtualItem[];
    virtualPaddingLeft: number;
    virtualPaddingRight: number;
  }>;

export type SST_RowVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableRowElement,
> = SST_Virtualizer<TScrollElement, TItemElement> &
  Readonly<{
    virtualRows: readonly SST_VirtualItem[];
  }>;
