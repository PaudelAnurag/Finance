"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { aiDefaults, businessDefaults, notificationOptions } from "@/data/mock-settings";
import { createPersistentStore } from "@/lib/persistent-store";

export interface AppSettings {
  companyName: string;
  industry: string;
  fiscalYear: string;
  companySize: string;
  forecastPeriod: string;
  responseStyle: string;
  notifications: Record<string, boolean>;
}

export const defaultSettings: AppSettings = {
  ...businessDefaults,
  ...aiDefaults,
  notifications: Object.fromEntries(notificationOptions.map((n) => [n.id, n.enabled])),
};

const store = createPersistentStore("local", "finance-os:settings:v1");

function parse(raw: string | null): AppSettings {
  if (!raw) return defaultSettings;
  try {
    const p = JSON.parse(raw) as Partial<AppSettings>;
    const str = (v: unknown, d: string) => (typeof v === "string" && v.trim() ? v : d);
    return {
      companyName: str(p.companyName, defaultSettings.companyName),
      industry: str(p.industry, defaultSettings.industry),
      fiscalYear: str(p.fiscalYear, defaultSettings.fiscalYear),
      companySize: str(p.companySize, defaultSettings.companySize),
      forecastPeriod: str(p.forecastPeriod, defaultSettings.forecastPeriod),
      responseStyle: str(p.responseStyle, defaultSettings.responseStyle),
      notifications: { ...defaultSettings.notifications, ...(typeof p.notifications === "object" && p.notifications ? p.notifications : {}) },
    };
  } catch {
    return defaultSettings;
  }
}

const Ctx = createContext<{ settings: AppSettings; save: (next: AppSettings) => boolean } | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const settings = useMemo(() => parse(raw), [raw]);
  const save = useCallback((next: AppSettings) => store.set(JSON.stringify(next)), []);
  const value = useMemo(() => ({ settings, save }), [settings, save]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
