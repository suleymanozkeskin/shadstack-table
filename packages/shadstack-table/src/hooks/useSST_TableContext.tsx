import { createContext, useContext } from 'react';
import { type SST_RowData, type SST_TableInstance } from '../types';

/**
 * Carries the table instance to every component below `SST_TablePaper`.
 *
 * The provided value is the referentially stable instance returned by
 * `useShadStackTable`, so the provider value never changes identity and
 * context consumers are never re-rendered BY the context — updates reach
 * components through their own state subscriptions
 * ({@link import('./useSST_TableState').useSST_TableState}) or through normal
 * parent renders. The stable instance always exposes the latest options,
 * atoms, and state, which is what makes it safe for a component woken by a
 * subscription to read while its parents skipped rendering.
 */
export const SST_TableContext = createContext<SST_TableInstance<SST_RowData> | null>(null);

/**
 * Read the table instance from context — for consumer-rendered slots (custom
 * `Cell`/`Header` renderers, toolbar slots) and internal components that are
 * composed without an explicit `table` prop.
 */
export const useSST_TableContext = <
  TData extends SST_RowData = SST_RowData,
>(): SST_TableInstance<TData> => {
  const table = useContext(SST_TableContext);
  if (!table) {
    throw new Error(
      'useSST_TableContext must be used inside a ShadStackTable (or SST_TablePaper) subtree.',
    );
  }
  return table as unknown as SST_TableInstance<TData>;
};
