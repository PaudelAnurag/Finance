// Tiny external store over Web Storage for useSyncExternalStore.
// The in-memory `cache` is the source of truth, so if storage is full or blocked
// the app keeps working for the session and `set` simply reports `false`.

export interface PersistentStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => string | null;
  getServerSnapshot: () => string | null;
  set: (value: string | null) => boolean;
}

export function createPersistentStore(kind: "session" | "local", key: string): PersistentStore {
  let cache: string | null | undefined;
  const listeners = new Set<() => void>();
  const storage = () => {
    try {
      return typeof window === "undefined" ? null : kind === "session" ? window.sessionStorage : window.localStorage;
    } catch {
      return null;
    }
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      if (cache === undefined) {
        try {
          cache = storage()?.getItem(key) ?? null;
        } catch {
          cache = null;
        }
      }
      return cache;
    },
    getServerSnapshot: () => null,
    set(value) {
      cache = value;
      let persisted = true;
      try {
        const s = storage();
        if (!s) persisted = false;
        else if (value === null) s.removeItem(key);
        else s.setItem(key, value);
      } catch {
        persisted = false;
      }
      listeners.forEach((l) => l());
      return persisted;
    },
  };
}
