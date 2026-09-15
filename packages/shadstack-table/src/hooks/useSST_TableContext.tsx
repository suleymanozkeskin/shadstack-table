import { createContext, useContext, type ReactNode } from 'react';
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
const tableContext = createContext<unknown>(null);

function TableProvider<TData extends SST_RowData>({
  value,
  children,
}: {
  value: SST_TableInstance<TData> | null;
  children?: ReactNode;
}) {
  return <tableContext.Provider value={value}>{children}</tableContext.Provider>;
}

export const SST_TableContext = { Provider: TableProvider };

/**
 * Read the table instance from context — for consumer-rendered slots (custom
 * `Cell`/`Header` renderers, toolbar slots) and internal components that are
 * composed without an explicit `table` prop.
 * The caller must use the row type of the enclosing table provider.
 */
export const useSST_TableContext = <
  TData extends SST_RowData = SST_RowData,
>(): SST_TableInstance<TData> => {
  const table = useContext(tableContext);

  if (!table) {
    throw new Error(
      'useSST_TableContext must be used inside a ShadStackTable (or SST_TablePaper) subtree.',
    );
  }

  // SAFETY: TData must match the row type of the enclosing table provider.
  return table as SST_TableInstance<TData>;
};
