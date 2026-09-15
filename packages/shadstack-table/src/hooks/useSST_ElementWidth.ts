import { type RefObject, useCallback, useSyncExternalStore } from 'react';

const serverWidth = () => 0;

/** Subscribes to the attached element width. Detachment disconnects the observer. */
export function useSST_ElementWidth(ref: RefObject<HTMLElement | null>): number {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const element = ref.current;

      if (!element) return () => {};

      const observer = new ResizeObserver(onChange);
      observer.observe(element);

      return () => observer.disconnect();
    },
    [ref],
  );

  const readWidth = useCallback(() => ref.current?.clientWidth ?? 0, [ref]);

  return useSyncExternalStore(subscribe, readWidth, serverWidth);
}
