"use client";

// Currency selection is global (topbar) and display-only for Phase 1 — mock
// values don't get FX-converted, only the currency tag/prefix changes.
import currencyCodes from "currency-codes";
import { useCallback, useMemo } from "react";

import { currencyForCountry, findFiscalCountry } from "@/lib/date-range/fiscal-year";
import { useSettings } from "@/lib/settings";
import { createRequiredContext, createStoredValue } from "@/lib/stored-context";

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

const { Provider, useRequired } = createRequiredContext<{
  currency: string;
  setCurrency: (code: string) => void;
}>("useCurrency must be used within CurrencyProvider");

// The user's own pick, persisted. Until they pick one, the currency follows the country in Settings.
const { store, useStoredValue } = createStoredValue<string | null>({
  kind: "local",
  key: "finance-os:currency:v1",
  parse: (raw) => raw,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const raw = useStoredValue();
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
  return <Provider value={value}>{children}</Provider>;
}

export const useCurrency = useRequired;

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
