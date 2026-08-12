import { shallow, useSelector } from '@tanstack/react-store';
import { type SST_RowData, type SST_TableInstance, type SST_TableState } from '../types';

/**
 * Subscribe to table state during render.
 *
 * This is the render-phase counterpart to `table.getState()`: the read IS the
 * subscription, so a component using it can never silently miss an update the
 * way an unsubscribed `getState()` read could. `getState()` remains correct
 * inside event handlers and effects, where a live un-subscribed read is
 * exactly what is wanted.
 *
 * With no selector the component subscribes to the full snapshot — one
 * re-render per state change, the pre-subscription behaviour. Passing a
 * selector narrows that: the selected value is shallow-compared, so project
 * exactly what the render reads, e.g.
 * `useSST_TableState(table, (s) => ({ density: s.density }))`, and the
 * component re-renders only when a selected value changes. Derived
 * projections (`(s) => ({ isResizing: !!s.columnResizing.isResizingColumn })`)
 * are encouraged — they re-render on the derived value, not the slice.
 */
export function useSST_TableState<TData extends SST_RowData>(
  table: SST_TableInstance<TData>,
): SST_TableState<TData>;
export function useSST_TableState<TData extends SST_RowData, TSelected>(
  table: SST_TableInstance<TData>,
  selector: (state: SST_TableState<TData>) => TSelected,
): TSelected;
export function useSST_TableState<TData extends SST_RowData, TSelected>(
  table: SST_TableInstance<TData>,
  selector?: (state: SST_TableState<TData>) => TSelected,
): SST_TableState<TData> | TSelected {
  const store = (
    table as unknown as {
      store: {
        get: () => SST_TableState<TData>;
        subscribe: (fn: (value: SST_TableState<TData>) => void) => { unsubscribe: () => void };
      };
    }
  ).store;
  // oxlint-disable-next-line react-hooks/rules-of-hooks -- single unconditional call; the overloads only affect typing
  return useSelector(store, selector as never, { compare: shallow });
}
