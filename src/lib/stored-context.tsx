"use client";

// Shared plumbing for the app's persisted providers (settings, API settings, currency,
// date range, dataset). Each one used to repeat the same four things by hand:
//   1. a Web Storage store,  2. useSyncExternalStore,  3. a memoized parse,  4. a context + throwing hook.
// Now: createStoredValue() covers 1-3 and createRequiredContext() covers 4.
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

import { createPersistentStore } from "@/lib/persistent-store";

/** One persisted blob in Web Storage, exposed as a parsed value. `parse` must be a stable (module-level) function. */
export function createStoredValue<T>({
  kind,
  key,
  parse,
}: {
  kind: "session" | "local";
  key: string;
  parse: (raw: string | null) => T;
}) {
  const store = createPersistentStore(kind, key);

  /** The parsed stored value; re-renders when the store changes. Safe on the server (parses `null`). */
  function useStoredValue(): T {
    const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    return useMemo(() => parse(raw), [raw]);
  }

  return { store, useStoredValue };
}

/** A context plus a hook that throws a clear message when used outside its provider. */
export function createRequiredContext<V>(errorMessage: string) {
  const Context = createContext<V | null>(null);

  function useRequired(): V {
    const ctx = useContext(Context);
    if (!ctx) throw new Error(errorMessage);
    return ctx;
  }

  return { Provider: Context.Provider, useRequired };
}
