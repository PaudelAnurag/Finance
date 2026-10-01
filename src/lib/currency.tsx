"use client";

// Currency selection is global (topbar) and display-only for Phase 1 — mock
// values don't get FX-converted, only the currency tag/prefix changes.
import currencyCodes from "currency-codes";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { currencyForCountry, findFiscalCountry } from "@/lib/date-range/fiscal-year";
import { createPersistentStore } from "@/lib/persistent-store";
import { useSettings } from "@/lib/settings";

export interface CurrencyOption {
  code: string;
  name: string;
}

export const currencyOptions: CurrencyOption[] = currencyCodes
  .codes()
  .map((code) => ({ code, name: currencyCodes.code(code)?.currency ?? code }))
  .sort((a, b) => a.code.localeCompare(b.code));

// Last resort only: normally the default comes from the country in Settings (US → USD).
const FALLBACK_CURRENCY = "USD";

const CurrencyContext = createContext<{
  currency: string;
  setCurrency: (code: string) => void;
} | null>(null);

// The user's own pick, persisted. Until they pick one, the currency follows the country in Settings.
const store = createPersistentStore("local", "finance-os:currency:v1");

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const { settings } = useSettings(); // CurrencyProvider must sit inside SettingsProvider
  const countryCurrency = useMemo(() => {
    const code = currencyForCountry(findFiscalCountry(settings.country) ?? { code: settings.country, name: settings.country });
    return code && currencyOptions.some((c) => c.code === code) ? code : FALLBACK_CURRENCY;
  }, [settings.country]);
  const currency = raw && currencyOptions.some((c) => c.code === raw) ? raw : countryCurrency;
  const setCurrency = useCallback((code: string) => {
    store.set(code);
  }, []);
  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

import { formatMoney, formatSignedMoney, renderMoneyTokens } from "@/lib/format";

/** Money formatters bound to the active currency. Phase 1: tag only, no FX. */
export function useMoney() {
  const { currency } = useCurrency();
  return {
    currency,
    fmt: (value: number, opts?: { compact?: boolean }) => formatMoney(value, currency, opts),
    signed: (value: number, opts?: { compact?: boolean; showPlus?: boolean }) =>
      formatSignedMoney(value, currency, opts),
    /** Renders `{m:123}` tokens in text with the active currency. */
    text: (value: string) => renderMoneyTokens(value, currency),
  };
}
