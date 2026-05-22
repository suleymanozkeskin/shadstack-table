/**
 * Lightweight debounce helper used by filter inputs.
 *
 * Returns a debounced wrapper around `fn` plus a `.cancel()` method that clears
 * the pending timer. Components that own a debounced callback should call
 * `.cancel()` in an unmount cleanup so a trailing invocation doesn't fire
 * against an unmounted component (e.g. `column.setFilterValue(...)` /
 * `setGlobalFilter(...)` after the row has been removed).
 */
export type SST_DebouncedFunction<F extends (...args: any[]) => void> = ((
  ...args: Parameters<F>
) => void) & {
  cancel: () => void;
};

export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  ms: number,
): SST_DebouncedFunction<F> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced as SST_DebouncedFunction<F>;
}
