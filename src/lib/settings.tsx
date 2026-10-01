"use client";

import { useCallback, useMemo } from "react";

import { aiDefaults, businessDefaults, notificationOptions } from "@/data/mock-settings";
import { isValidIso } from "@/lib/date-range/dates";
import { createRequiredContext, createStoredValue } from "@/lib/stored-context";

export interface AppSettings {
  companyName: string;
  industry: string;
  fiscalYear: string;
  /** ISO 3166-1 alpha-2 country code (e.g. "NP") used to look up the fiscal year. Defaults to "US". */
  country: string;
  /** One-time setup: after the country has been changed once it is locked for good. */
  countryLocked: boolean;
  /** One-time setup: after the fiscal-year dates have been changed once they are locked for good. */
  fiscalYearLocked: boolean;
  /**
   * The company's own fiscal-year dates. `null` = automatic (from the selected currency's country).
   * Once the user edits the dates they live here and are never overwritten by re-renders or
   * currency changes; "Reset" in Settings sets it back to null.
   */
  fiscalYearCustom: { start: string; end: string } | null;
  companySize: string;
  forecastPeriod: string;
  responseStyle: string;
  notifications: Record<string, boolean>;
  // Note: the company's data API connection lives in @/lib/api-settings
  // (useApiSettings), not here — it's a separate settings domain edited by
  // its own "API Connection" section in Settings, with its own request-header
  // logic (authHeaders() in @/lib/api/analyze.ts). Don't re-add api* fields
  // here; that's exactly the duplicate-auth-implementation bug this avoids.
}

const DEFAULT_COUNTRY = "US";

export const defaultSettings: AppSettings = {
  ...businessDefaults,
  ...aiDefaults,
  country: DEFAULT_COUNTRY,
  countryLocked: false,
  fiscalYearLocked: false,
  fiscalYearCustom: null,
  notifications: Object.fromEntries(notificationOptions.map((n) => [n.id, n.enabled])),
};

function parseFiscalCustom(v: unknown): AppSettings["fiscalYearCustom"] {
  if (!v || typeof v !== "object") return null;
  const { start, end } = v as { start?: unknown; end?: unknown };
  return isValidIso(start) && isValidIso(end) && start <= end ? { start, end } : null;
}

export function parseSettings(raw: string | null): AppSettings {
  if (!raw) return defaultSettings;
  try {
    const p = JSON.parse(raw) as Partial<AppSettings>;
    const str = (v: unknown, d: string) => (typeof v === "string" && v.trim() ? v : d);
    return {
      companyName: str(p.companyName, defaultSettings.companyName),
      industry: str(p.industry, defaultSettings.industry),
      fiscalYear: str(p.fiscalYear, defaultSettings.fiscalYear),
      country: typeof p.country === "string" && /^[A-Za-z]{2}$/.test(p.country) ? p.country.toUpperCase() : DEFAULT_COUNTRY,
      countryLocked: p.countryLocked === true,
      // A locked fiscal year always has dates; without them there is nothing to lock.
      fiscalYearLocked: p.fiscalYearLocked === true && parseFiscalCustom(p.fiscalYearCustom) !== null,
      fiscalYearCustom: parseFiscalCustom(p.fiscalYearCustom),
      companySize: str(p.companySize, defaultSettings.companySize),
      forecastPeriod: str(p.forecastPeriod, defaultSettings.forecastPeriod),
      responseStyle: str(p.responseStyle, defaultSettings.responseStyle),
      notifications: { ...defaultSettings.notifications, ...(typeof p.notifications === "object" && p.notifications ? p.notifications : {}) },
    };
  } catch {
    return defaultSettings;
  }
}

/** Keeps locked one-time settings exactly as they are, whatever `next` says. */
export function applyLocks(current: AppSettings, next: AppSettings): AppSettings {
  const merged: AppSettings = { ...next };
  if (current.countryLocked) {
    merged.country = current.country;
    merged.countryLocked = true;
  }
  if (current.fiscalYearLocked) {
    merged.fiscalYearCustom = current.fiscalYearCustom;
    merged.fiscalYearLocked = true;
  }
  return merged;
}

const { store, useStoredValue } = createStoredValue({ kind: "local", key: "finance-os:settings:v1", parse: parseSettings });
const { Provider, useRequired } = createRequiredContext<{ settings: AppSettings; save: (next: AppSettings) => boolean }>(
  "useSettings must be used within SettingsProvider",
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = useStoredValue();
  // The one-time rules are enforced here, not just in the UI: once country / fiscal year are locked,
  // no caller (stale form, another tab, future code) can change them.
  const save = useCallback(
    (next: AppSettings) => store.set(JSON.stringify(applyLocks(parseSettings(store.getSnapshot()), next))),
    [],
  );
  const value = useMemo(() => ({ settings, save }), [settings, save]);
  return <Provider value={value}>{children}</Provider>;
}

export const useSettings = useRequired;
