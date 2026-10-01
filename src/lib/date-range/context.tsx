"use client";

// THE single source of truth for the financial reporting period.
//
//   Settings (country → fiscal rule; country defaults to the currency's; optional user date override)
//        ↓
//   Fiscal year configuration            (what "a fiscal year" means for this company)
//        ↓
//   Selected preset / custom range       (what the user is looking at right now)
//        ↓
//   FinancialDateRange  ──►  DatasetProvider filters transactions once ──► every page
//
// Nothing else in the app keeps its own date range. Pages just read the dataset.
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { useCurrency } from "@/lib/currency";
import {
  formatSpan,
  isValidIso,
  isoToLocalDate,
  toIsoLocal,
  type IsoDate,
} from "@/lib/date-range/dates";
import {
  fiscalYearLabel,
  resolveAutoFiscalYear,
  rollFiscalYear,
  type AutoFiscalYear,
  type FiscalYear,
} from "@/lib/date-range/fiscal-year";
import { presetOptions, resolvePeriod, type PresetId } from "@/lib/date-range/periods";
import { createPersistentStore } from "@/lib/persistent-store";
import { useSettings } from "@/lib/settings";

export interface FinancialDateRange {
  startDate: Date;
  endDate: Date;
  label: string;
  /** Same period as yyyy-mm-dd strings — what filtering and API queries use. */
  startIso: IsoDate;
  endIso: IsoDate;
  preset: PresetId;
}

interface Selection {
  preset: PresetId;
  customStart?: IsoDate;
  customEnd?: IsoDate;
}

const DEFAULT_SELECTION: Selection = { preset: "this-fiscal-year" };
const PRESETS = new Set<string>(presetOptions.map((p) => p.id));

// The chosen period survives navigation and refresh in this tab (like the uploaded data does).
const store = createPersistentStore("session", "finance-os:date-range:v1");

function parseSelection(raw: string | null): Selection {
  if (!raw) return DEFAULT_SELECTION;
  try {
    const p = JSON.parse(raw) as Partial<Selection>;
    if (typeof p.preset !== "string" || !PRESETS.has(p.preset)) return DEFAULT_SELECTION;
    const preset = p.preset as PresetId;
    if (preset === "custom") {
      if (!isValidIso(p.customStart) || !isValidIso(p.customEnd) || p.customStart > p.customEnd) return DEFAULT_SELECTION;
      return { preset, customStart: p.customStart, customEnd: p.customEnd };
    }
    return { preset };
  } catch {
    return DEFAULT_SELECTION;
  }
}

// "Today" as a stable string so useSyncExternalStore doesn't re-render endlessly. During hydration
// React uses the server value, then swaps to the client's local date without a mismatch error.
const subscribeToday = () => () => {};
const getToday = () => toIsoLocal(new Date());

export interface FiscalYearInfo {
  /** The fiscal year in force today (the user's custom dates if set, else the country's). */
  current: FiscalYear;
  label: string;
  isCustom: boolean;
  /** What the country/currency would give on its own — used for "Reset to default". */
  auto: AutoFiscalYear;
}

export interface PeriodChoice {
  id: PresetId;
  label: string;
  /** Resolved dates, e.g. "Jul 16, 2026 – Oct 15, 2026" (null for Custom Range). */
  span: string | null;
}

interface Api {
  range: FinancialDateRange;
  fiscalYear: FiscalYearInfo;
  today: IsoDate;
  choices: PeriodChoice[];
  selectPreset: (id: Exclude<PresetId, "custom">) => void;
  /** Applies a custom range. Returns an error message, or null on success. */
  applyCustomRange: (start: string, end: string) => string | null;
}

const Ctx = createContext<Api | null>(null);

export function FinancialDateRangeProvider({ children }: { children: React.ReactNode }) {
  const { currency } = useCurrency();
  const { settings } = useSettings();
  const today = useSyncExternalStore(subscribeToday, getToday, getToday);
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const selection = useMemo(() => parseSelection(raw), [raw]);

  // ---- fiscal year configuration ----
  const custom = settings.fiscalYearCustom;
  const auto = useMemo(
    () => resolveAutoFiscalYear({ country: settings.country, currency }, today),
    [settings.country, currency, today],
  );
  const fiscalYear = useMemo<FiscalYearInfo>(() => {
    const current = custom ? rollFiscalYear(custom, today) : auto.current;
    return { current, label: fiscalYearLabel(current), isCustom: custom !== null, auto };
  }, [custom, auto, today]);

  // ---- selected reporting period ----
  const activeFy = fiscalYear.current;
  const range = useMemo<FinancialDateRange>(() => {
    const p = resolvePeriod(selection.preset, {
      today,
      fiscalYear: activeFy,
      custom: selection.customStart && selection.customEnd ? { start: selection.customStart, end: selection.customEnd } : null,
    });
    return {
      startDate: isoToLocalDate(p.startIso),
      endDate: isoToLocalDate(p.endIso),
      label: p.label,
      startIso: p.startIso,
      endIso: p.endIso,
      preset: selection.preset,
    };
  }, [selection, today, activeFy]);

  const choices = useMemo<PeriodChoice[]>(
    () =>
      presetOptions.map(({ id, label }) => {
        if (id === "custom") return { id, label, span: null };
        const p = resolvePeriod(id, { today, fiscalYear: activeFy });
        return { id, label, span: formatSpan(p.startIso, p.endIso) };
      }),
    [today, activeFy],
  );

  const selectPreset = useCallback((id: Exclude<PresetId, "custom">) => {
    store.set(JSON.stringify({ preset: id } satisfies Selection));
  }, []);

  const applyCustomRange = useCallback((start: string, end: string) => {
    if (!isValidIso(start) || !isValidIso(end)) return "Choose both a start and an end date.";
    if (end < start) return "End date can't be before the start date.";
    store.set(JSON.stringify({ preset: "custom", customStart: start, customEnd: end } satisfies Selection));
    return null;
  }, []);

  const value = useMemo<Api>(
    () => ({ range, fiscalYear, today, choices, selectPreset, applyCustomRange }),
    [range, fiscalYear, today, choices, selectPreset, applyCustomRange],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useApi() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Date-range hooks must be used within FinancialDateRangeProvider");
  return ctx;
}

/** The global reporting period. Read-only for pages; change it through `useDateRangeControls`. */
export const useFinancialDateRange = () => useApi().range;
export const useFiscalYear = () => useApi().fiscalYear;
export const useToday = () => useApi().today;
export function useDateRangeControls() {
  const { choices, selectPreset, applyCustomRange, range } = useApi();
  return { choices, selectPreset, applyCustomRange, active: range.preset };
}
