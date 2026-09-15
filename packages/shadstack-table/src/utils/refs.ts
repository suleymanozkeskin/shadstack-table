import { type RefObject } from 'react';

/** Registers an attached control. A null node removes the detached control. */
export function setElementRef<TElement extends HTMLElement>(
  registry: RefObject<Record<string, TElement> | null>,
  id: string,
  node: TElement | null,
): void {
  const elements = registry.current;

  if (!elements) return;

  if (node) elements[id] = node;
  else delete elements[id];
}
