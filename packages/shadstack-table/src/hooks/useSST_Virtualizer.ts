import { useEffect, useLayoutEffect, useReducer, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  type PartialKeys,
  type VirtualizerOptions,
} from '@tanstack/react-virtual';
import { type SST_Virtualizer } from '../types';

const useVirtualizerEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

/** Keeps mutable geometry inside the adapter and returns a snapshot for each render. */
export function useSST_Virtualizer<TScroll extends Element, TItem extends Element>(
  options: PartialKeys<
    VirtualizerOptions<TScroll, TItem>,
    'observeElementRect' | 'observeElementOffset' | 'scrollToFn'
  >,
): SST_Virtualizer<TScroll, TItem> {
  const [, rerender] = useReducer(() => ({}), {});

  const resolvedOptions: VirtualizerOptions<TScroll, TItem> = {
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
    onChange: (virtualizer, sync) => {
      if (sync) flushSync(rerender);
      else rerender();
      options.onChange?.(virtualizer, sync);
    },
  };

  const [instance] = useState(() => new Virtualizer(resolvedOptions));
  instance.setOptions(resolvedOptions);

  // oxlint-disable-next-line no-underscore-dangle -- TanStack requires this named lifecycle method in framework adapters.
  useVirtualizerEffect(() => instance._didMount(), [instance]);
  // oxlint-disable-next-line no-underscore-dangle -- TanStack requires this named lifecycle method in framework adapters.
  useVirtualizerEffect(() => instance._willUpdate());

  // The scroll container is an ancestor. Its ref is attached after child layout effects.
  // oxlint-disable-next-line no-underscore-dangle -- Complete TanStack setup after the ancestor ref is attached.
  useEffect(() => instance._willUpdate(), [instance]);

  const items = Object.freeze(instance.getVirtualItems().map((item) => Object.freeze({ ...item })));
  const totalSize = instance.getTotalSize();

  return Object.freeze({
    getVirtualItems: () => items,
    getTotalSize: () => totalSize,
    measure: instance.measure,
    measureElement: instance.measureElement,
    resizeItem: instance.resizeItem,
    scrollBy: instance.scrollBy,
    scrollToIndex: instance.scrollToIndex,
    scrollToOffset: instance.scrollToOffset,
  });
}
