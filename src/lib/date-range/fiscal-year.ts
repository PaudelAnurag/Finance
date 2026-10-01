// Fiscal-year logic.
//
// Country rules come from the `get-fiscal-year` package — no country dates are hardcoded here.
// We only read the package's month/day RULE (start + end), then work out which year contains
// "today" ourselves: the package's own "current" picker mis-handles some dates (it compares
// month and day independently), so we don't trust its year.
import currencyCodes from "currency-codes";
import GetFiscalYear from "get-fiscal-year";
import fiscalData from "get-fiscal-year/src/fiscal-data.js";

import { addDays, addMonths, addYears, isValidIso, isoFromParts, type IsoDate } from "@/lib/date-range/dates";

/** A concrete fiscal year, e.g. 2026-07-16 → 2027-07-15. */
export interface FiscalYear {
  start: IsoDate;
  end: IsoDate;
}

/** The recurring month/day rule for a country. */
export interface FiscalRule {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

/** A country the fiscal-year package has data for. */
export interface FiscalCountry {
  /** ISO 3166-1 alpha-2, e.g. "NP". */
  code: string;
  name: string;
}

export interface AutoFiscalYear {
  /** Display name of the country the rule came from; null when nothing matched. */
  country: string | null;
  countryCode: string | null;
  /** Where the country came from: the user's Settings choice, or derived from the currency. */
  source: "country" | "currency" | "default";
  /** The fiscal year containing today. */
  current: FiscalYear;
  /** True when no country rule was found and a plain calendar year is used. */
  isFallback: boolean;
}

// Generic default (not country-specific) used only when the package has no data for a currency.
const CALENDAR_YEAR: FiscalRule = { startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 };

// The package logs console.error for unknown countries; we probe several candidates, so silence it.
function quiet<T>(fn: () => T): T {
  const original = console.error;
  console.error = () => {};
  try {
    return fn();
  } finally {
    console.error = original;
  }
}

/** Reads the month/day rule for a country code or name from get-fiscal-year. */
function lookupRule(country: string): FiscalRule | null {
  try {
    const result = quiet(() => new GetFiscalYear().getFiscalYear(country));
    if (!result) return null;
    // The package builds these with `new Date(y, m, d).toISOString()` (local midnight),
    // so LOCAL getters recover the intended calendar day in any timezone.
    const start = new Date(result.fiscalYearStart);
    const end = new Date(result.fiscalYearEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return {
      startMonth: start.getMonth() + 1,
      startDay: start.getDate(),
      endMonth: end.getMonth() + 1,
      endDay: end.getDate(),
    };
  } catch {
    return null;
  }
}

const cleanName = (name: string) => name.replace(/\s*\(.*?\)\s*/g, "").trim();

let countryCache: FiscalCountry[] | null = null;

/** Rule for a country code: the package's fiscal dates, or a calendar year if the package says so. */
function ruleFor(code: string): FiscalRule | null {
  const fromPackage = lookupRule(code);
  if (fromPackage) return fromPackage;
  const entry = fiscalData.find((c) => c.code === code.toUpperCase());
  return entry?.calendarYear ? CALENDAR_YEAR : null;
}

/**
 * Every country get-fiscal-year knows, sorted by name. Names come from the package's own table
 * (static), NOT Intl.DisplayNames: Node and browsers spell some countries differently
 * ("Hong Kong SAR China" vs "Hong Kong SAR"), which caused a hydration mismatch in the Settings select.
 */
export function listFiscalCountries(): FiscalCountry[] {
  if (countryCache) return countryCache;
  const seen = new Set<string>();
  const out: FiscalCountry[] = [];
  for (const c of fiscalData) {
    if (!c.code || !c.country || seen.has(c.code)) continue;
    if (!ruleFor(c.code)) continue;
    seen.add(c.code);
    out.push({ code: c.code, name: c.country });
  }
  countryCache = out.sort((x, y) => x.name.localeCompare(y.name, "en"));
  return countryCache;
}

export const findFiscalCountry = (code: string | null | undefined) =>
  code ? listFiscalCountries().find((c) => c.code === code.toUpperCase()) ?? null : null;

/** The country a currency most likely belongs to, among countries we have fiscal data for. */
export function countryForCurrency(currency: string): FiscalCountry | null {
  const list = listFiscalCountries();
  // ISO 4217 codes start with their ISO 3166 country code (NPR → NP, USD → US, GBP → GB).
  const byCode = list.find((c) => c.code === currency.slice(0, 2).toUpperCase());
  if (byCode) return byCode;
  // Shared/special currencies (EUR, XOF, …): first listed country we have data for.
  const listed = (currencyCodes.code(currency)?.countries ?? []).map((n) => cleanName(n).toLowerCase());
  for (const name of listed) {
    const match = list.find((c) => c.name.toLowerCase() === name || name.includes(c.name.toLowerCase()));
    if (match) return match;
  }
  return null;
}

// Not everyday currencies: bond markets, precious metals, "WIR" funds, indexed units, …
const NON_STANDARD_CURRENCY = /wir|fund|next day|unidad|\(|sdr|bond|member|palladium|gold|silver|platinum|testing|no currency|codes specifically/i;
const wordsOf = (s: string) => ` ${s.toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z ]/g, " ").replace(/\band\b/g, " ").replace(/\s+/g, " ").trim()} `;

/**
 * The everyday currency code for a country (US → USD, Nepal → NPR, Germany → EUR), or null when
 * none is clear. ISO 4217 codes start with their ISO 3166 country code; shared currencies
 * (EUR, XOF, …) are matched by country name using whole words (so "Niger" never matches "Nigeria").
 */
export function currencyForCountry(country: FiscalCountry): string | null {
  const standard = currencyCodes.codes().filter((c) => {
    const info = currencyCodes.code(c);
    return !!info && !NON_STANDARD_CURRENCY.test(info.currency);
  });
  const byPrefix = standard.filter((c) => c.startsWith(country.code)).sort()[0];
  if (byPrefix) return byPrefix;
  const name = wordsOf(country.name);
  const byName = standard
    .filter((c) => (currencyCodes.code(c)?.countries ?? []).some((x) => wordsOf(x).includes(name) || name.includes(wordsOf(x))))
    .sort()[0];
  return byName ?? null;
}

/** Month/day rule for a currency's country (kept for callers that only have a currency). */
export function resolveFiscalRule(currency: string): { country: string; rule: FiscalRule } | null {
  const country = countryForCurrency(currency);
  const rule = country ? ruleFor(country.code) : null;
  return country && rule ? { country: country.name, rule } : null;
}

/** The rule's fiscal year that contains `today`. */
export function fiscalYearFromRule(rule: FiscalRule, today: IsoDate): FiscalYear {
  const ty = +today.slice(0, 4);
  const endsNextYear = rule.endMonth < rule.startMonth || (rule.endMonth === rule.startMonth && rule.endDay < rule.startDay);
  for (const y of [ty - 1, ty]) {
    const start = isoFromParts(y, rule.startMonth, rule.startDay);
    const end = isoFromParts(endsNextYear ? y + 1 : y, rule.endMonth, rule.endDay);
    if (start <= today && today <= end) return { start, end };
  }
  const start = isoFromParts(ty, rule.startMonth, rule.startDay);
  return { start, end: isoFromParts(endsNextYear ? ty + 1 : ty, rule.endMonth, rule.endDay) };
}

/**
 * Automatic fiscal year. Uses the country chosen in Settings; if none is chosen (or it has no data)
 * it falls back to the currency's country; if that fails too, a plain calendar year.
 */
export function resolveAutoFiscalYear(
  input: { country?: string | null; currency: string },
  today: IsoDate,
): AutoFiscalYear {
  const chosen = findFiscalCountry(input.country);
  const fromCurrency = chosen ? null : countryForCurrency(input.currency);
  const country = chosen ?? fromCurrency;
  const rule = country ? ruleFor(country.code) : null;
  if (country && rule) {
    return {
      country: country.name,
      countryCode: country.code,
      source: chosen ? "country" : "currency",
      current: fiscalYearFromRule(rule, today),
      isFallback: false,
    };
  }
  return {
    country: null,
    countryCode: null,
    source: "default",
    current: fiscalYearFromRule(CALENDAR_YEAR, today),
    isFallback: true,
  };
}

/** True when the fiscal year is a normal "one year, back to back" period (end + 1 day = next start). */
const isAnnual = (fy: FiscalYear) => addDays(fy.end, 1) === addYears(fy.start, 1);

/** Moves a fiscal year by whole years (keeps annual years exact across leap days). */
export function shiftFiscalYear(fy: FiscalYear, years: number): FiscalYear {
  const start = addYears(fy.start, years);
  return { start, end: isAnnual(fy) ? addDays(addYears(fy.start, years + 1), -1) : addYears(fy.end, years) };
}

/**
 * The user's configured fiscal year rolled forward/back by whole years so it contains `today`.
 * A custom FY entered as 2026-07-16 → 2027-07-15 keeps working in 2028 without being re-entered.
 */
export function rollFiscalYear(fy: FiscalYear, today: IsoDate): FiscalYear {
  const base = +today.slice(0, 4) - +fy.start.slice(0, 4);
  for (const k of [base, base - 1, base + 1, base - 2]) {
    const s = shiftFiscalYear(fy, k);
    if (s.start <= today && today <= s.end) return s;
  }
  // Short custom period that doesn't cover today: use the latest occurrence that has started.
  const k = shiftFiscalYear(fy, base).start > today ? base - 1 : base;
  return shiftFiscalYear(fy, k);
}

/** "FY 2026/27" (or "FY 2026" when the year starts and ends in the same calendar year). */
export function fiscalYearLabel(fy: FiscalYear): string {
  const sy = fy.start.slice(0, 4);
  const ey = fy.end.slice(0, 4);
  return sy === ey ? `FY ${sy}` : `FY ${sy}/${ey.slice(2)}`;
}

/** Validates a user-entered fiscal year. Returns an error message, or null when fine. */
export function validateFiscalYear(fy: { start: string; end: string }): string | null {
  if (!isValidIso(fy.start)) return "Enter a valid fiscal-year start date.";
  if (!isValidIso(fy.end)) return "Enter a valid fiscal-year end date.";
  if (fy.end < fy.start) return "Fiscal-year end date can't be before the start date.";
  if (fy.end >= addYears(fy.start, 2)) return "A fiscal year can't be longer than two years.";
  return null;
}

/** First month of a fiscal quarter helper: the start of quarter `i` (0-based) within a fiscal year. */
export const quarterStart = (fy: FiscalYear, i: number) => addMonths(fy.start, i * 3);
