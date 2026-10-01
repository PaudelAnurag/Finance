"use client";

// Per-company API connection for Upload Data → "Connect an API" tab.
// Configured in Settings, never hardcoded, since each company's accounting
// API differs in URL, auth, response shape and field names.
import { useCallback, useMemo } from "react";

import { createRequiredContext, createStoredValue } from "@/lib/stored-context";

export type AuthScheme = "none" | "bearer" | "header";

export interface FieldMap {
  date: string;
  description: string;
  category: string;
  type: string; // leave blank to infer Income/Expense from the sign of `amount` instead
  amount: string;
  status: string; // leave blank to treat every row as Completed
}

export interface ApiSettings {
  name: string; // shown on the Upload page, e.g. "Xero" or "Internal ERP"
  url: string;
  authScheme: AuthScheme;
  headerName: string; // used when authScheme === "header"
  apiKey: string;
  responsePath: string; // dot path to the transactions array; blank = response is the array
  fieldMap: FieldMap;
  incomeWord: string; // value of the `type` field meaning income, e.g. "income" or "credit"
  expenseWord: string;
}

export const defaultApiSettings: ApiSettings = {
  name: "",
  url: "",
  authScheme: "bearer",
  headerName: "x-api-key",
  apiKey: "",
  responsePath: "",
  fieldMap: { date: "date", description: "description", category: "category", type: "type", amount: "amount", status: "status" },
  incomeWord: "income",
  expenseWord: "expense",
};

function parse(raw: string | null): ApiSettings {
  if (!raw) return defaultApiSettings;
  try {
    const p = JSON.parse(raw) as Partial<ApiSettings>;
    return {
      ...defaultApiSettings,
      ...p,
      fieldMap: { ...defaultApiSettings.fieldMap, ...(p.fieldMap ?? {}) },
    };
  } catch {
    return defaultApiSettings;
  }
}

const { store, useStoredValue } = createStoredValue({ kind: "local", key: "finance-os:api-settings:v1", parse });
const { Provider, useRequired } = createRequiredContext<{ apiSettings: ApiSettings; save: (next: ApiSettings) => boolean }>(
  "useApiSettings must be used within ApiSettingsProvider",
);

export function ApiSettingsProvider({ children }: { children: React.ReactNode }) {
  const apiSettings = useStoredValue();
  const save = useCallback((next: ApiSettings) => store.set(JSON.stringify(next)), []);
  const value = useMemo(() => ({ apiSettings, save }), [apiSettings, save]);
  return <Provider value={value}>{children}</Provider>;
}

export const useApiSettings = useRequired;
