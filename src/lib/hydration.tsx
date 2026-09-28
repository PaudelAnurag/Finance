"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false on the server and during hydration, true afterwards (no setState-in-effect). */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * Hides children until the client has hydrated, so stored data (uploaded CSV,
 * saved settings) never flashes the default/demo values first. Layout is unaffected.
 */
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  return <div style={{ display: "contents", visibility: hydrated ? "visible" : "hidden" }}>{children}</div>;
}
