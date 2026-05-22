import {
  type VirtualItem,
  type Virtualizer,
  type VirtualizerOptions,
} from '@tanstack/react-virtual';

export type SST_VirtualItem = VirtualItem;

export type SST_VirtualizerOptions<
  TScrollElement extends Element | Window = Element | Window,
  TItemElement extends Element = Element,
> = VirtualizerOptions<TScrollElement, TItemElement>;

export type SST_ColumnVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableCellElement,
> = Virtualizer<TScrollElement, TItemElement> & {
  virtualColumns: SST_VirtualItem[];
  virtualPaddingLeft?: number;
  virtualPaddingRight?: number;
};

export type SST_RowVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableRowElement,
> = Virtualizer<TScrollElement, TItemElement> & {
  virtualRows: SST_VirtualItem[];
};
