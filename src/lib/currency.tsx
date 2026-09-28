"use client";

// Currency selection is global (topbar) and display-only for Phase 1 — mock
// values don't get FX-converted, only the currency tag/prefix changes.
import currencyCodes from "currency-codes";
import { createContext, useContext, useMemo, useState } from "react";

export interface CurrencyOption {
  code: string;
  name: string;
}

export const currencyOptions: CurrencyOption[] = currencyCodes
  .codes()
  .map((code) => ({ code, name: currencyCodes.code(code)?.currency ?? code }))
  .sort((a, b) => a.code.localeCompare(b.code));

const DEFAULT_CURRENCY = "NPR";

const CurrencyContext = createContext<{
  currency: string;
  setCurrency: (code: string) => void;
} | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const value = useMemo(() => ({ currency, setCurrency }), [currency]);
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
