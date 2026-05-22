import { type SST_Cell, type SST_RowData, type SST_TableInstance } from '../types';

/**
 * Identifies which user-facing copy affordance triggered a clipboard write.
 * Surfaced on the `onCopyError` context so consumers can branch on origin
 * (e.g. only toast for explicit button clicks, suppress keyboard-shortcut noise).
 */
export type SST_CopySource = 'button' | 'keyboard' | 'cell-menu';

export interface SST_CopyContext<TData extends SST_RowData> {
  /** The string value the user intended to copy. */
  value: string;
  /** The originating cell when the call site has one. Context-menu always has it; the keyboard handler usually does. */
  cell?: SST_Cell<TData>;
  /** Identifies which copy path triggered. */
  source: SST_CopySource;
}

/**
 * Writes `value` to the system clipboard. Returns `true` on success, `false`
 * on rejection (insecure context, denied permission, iframe restrictions, the
 * Clipboard API being entirely absent, …).
 *
 * On failure the consumer's `table.options.onCopyError` is invoked with the
 * underlying error plus a context payload. The library itself never logs to
 * the console — copy failure is a recoverable user action and spam-free by
 * design.
 */
export const copyToClipboard = async <TData extends SST_RowData>(
  table: SST_TableInstance<TData>,
  ctx: SST_CopyContext<TData>,
): Promise<boolean> => {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(ctx.value);
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    table.options.onCopyError?.(error, {
      value: ctx.value,
      source: ctx.source,
      cell: ctx.cell,
    });
    return false;
  }
};
