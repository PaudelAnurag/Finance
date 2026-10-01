// Run: npx tsx scripts/verify-date-range.ts   (also run under other timezones: TZ=Asia/Kathmandu …)
// Proves the fiscal-year rules, the period presets and the period filter behave, in any timezone.
import assert from "node:assert/strict";

import type { Transaction } from "../src/data/mock-transactions";
import { addDays, addMonths, addYears, formatSpan, isValidIso } from "../src/lib/date-range/dates";
import { filterByRange, rangeToQuery } from "../src/lib/date-range/filter";
import { applyLocks, defaultSettings, parseSettings } from "../src/lib/settings";
import {
  countryForCurrency,
  currencyForCountry,
  findFiscalCountry,
  fiscalYearFromRule,
  listFiscalCountries,
  fiscalYearLabel,
  resolveAutoFiscalYear,
  resolveFiscalRule,
  rollFiscalYear,
  shiftFiscalYear,
  validateFiscalYear,
} from "../src/lib/date-range/fiscal-year";
import { resolvePeriod } from "../src/lib/date-range/periods";
import { buildCsvDataset } from "../src/lib/dataset/from-transactions";

// ---- dates ----
assert.equal(addDays("2026-02-28", 1), "2026-03-01");
assert.equal(addDays("2028-02-28", 1), "2028-02-29");
assert.equal(addMonths("2026-01-31", 1), "2026-02-28"); // day clamps
assert.equal(addYears("2028-02-29", 1), "2029-02-28");
assert.ok(isValidIso("2026-02-28") && !isValidIso("2026-02-30") && !isValidIso("26-02-28"));

// ---- country rule comes from get-fiscal-year (Nepal: July 16 – July 15) ----
const np = resolveFiscalRule("NPR");
assert.ok(np, "NPR should resolve");
assert.deepEqual(np.rule, { startMonth: 7, startDay: 16, endMonth: 7, endDay: 15 });
assert.equal(np.country, "Nepal");
assert.deepEqual(fiscalYearFromRule(np.rule, "2026-09-30"), { start: "2026-07-16", end: "2027-07-15" });
assert.deepEqual(fiscalYearFromRule(np.rule, "2026-07-15"), { start: "2025-07-16", end: "2026-07-15" }); // last day
assert.deepEqual(fiscalYearFromRule(np.rule, "2026-07-16"), { start: "2026-07-16", end: "2027-07-15" }); // first day
assert.deepEqual(fiscalYearFromRule(np.rule, "2027-01-05"), { start: "2026-07-16", end: "2027-07-15" });

// The package's own "current" picker gets Jan 31 wrong for a Oct–Sep year; ours must not.
const us = resolveFiscalRule("USD");
assert.ok(us);
assert.deepEqual(fiscalYearFromRule(us.rule, "2027-01-31"), { start: "2026-10-01", end: "2027-09-30" });

// Calendar-year rule + unknown currency fallback
assert.equal(resolveAutoFiscalYear({ currency: "XXX" }, "2026-09-30").isFallback, true);
assert.deepEqual(resolveAutoFiscalYear({ currency: "XXX" }, "2026-09-30").current, { start: "2026-01-01", end: "2026-12-31" });
assert.equal(resolveAutoFiscalYear({ currency: "NPR" }, "2026-09-30").isFallback, false);

// ---- country setting: chosen country wins, else currency's country, else calendar year ----
const countries = listFiscalCountries();
assert.ok(countries.length > 150, "should list every country in the package, calendar-year ones too");
assert.deepEqual(countries.map((c) => c.code), listFiscalCountries().map((c) => c.code)); // stable order
assert.equal(new Set(countries.map((c) => c.code)).size, countries.length); // no duplicates
const al = resolveAutoFiscalYear({ country: "AL", currency: "NPR" }, "2026-09-30"); // calendar-year country
assert.equal(al.source, "country");
assert.deepEqual(al.current, { start: "2026-01-01", end: "2026-12-31" });
assert.equal(findFiscalCountry("HK")?.name, "Hong Kong"); // static name, never Intl-dependent
assert.ok(countries.some((c) => c.code === "NP" && c.name === "Nepal"));
assert.equal(findFiscalCountry("np")?.name, "Nepal");
assert.equal(findFiscalCountry("ZZ"), null);
assert.equal(countryForCurrency("NPR")?.code, "NP");
const fromCurrency = resolveAutoFiscalYear({ country: null, currency: "NPR" }, "2026-09-30");
assert.equal(fromCurrency.source, "currency");
assert.equal(fromCurrency.countryCode, "NP");
const chosen = resolveAutoFiscalYear({ country: "AU", currency: "NPR" }, "2026-09-30"); // country overrides currency
assert.equal(chosen.source, "country");
assert.equal(chosen.country, "Australia");
assert.deepEqual(chosen.current, { start: "2026-07-01", end: "2027-06-30" });
const badCountry = resolveAutoFiscalYear({ country: "ZZ", currency: "NPR" }, "2026-09-30"); // unknown → currency
assert.equal(badCountry.countryCode, "NP");
assert.equal(resolveAutoFiscalYear({ country: null, currency: "XXX" }, "2026-09-30").source, "default");

// ---- country → currency (shown in the one-time confirm popup) ----
const cur = (code: string) => currencyForCountry(findFiscalCountry(code)!);
assert.equal(cur("US"), "USD");
assert.equal(cur("NP"), "NPR");
assert.equal(cur("GB"), "GBP");
assert.equal(cur("CH"), "CHF"); // not the WIR funds
assert.equal(cur("DE"), "EUR"); // shared currency, matched by name
assert.equal(cur("NE"), "XOF"); // Niger must not match Nigeria (NGN)
assert.equal(cur("EC"), "USD");
assert.equal(currencyForCountry({ code: "US", name: "United States" }), "USD"); // default country → default currency

// ---- one-time settings: defaults, parsing, locks ----
assert.equal(defaultSettings.country, "US");
assert.equal(defaultSettings.countryLocked, false);
assert.equal(defaultSettings.fiscalYearLocked, false);
assert.equal(parseSettings(null).country, "US");
assert.equal(parseSettings(JSON.stringify({ country: "xx1" })).country, "US"); // invalid → default
assert.equal(parseSettings(JSON.stringify({ fiscalYearLocked: true })).fiscalYearLocked, false); // no dates, nothing to lock
const unlocked = defaultSettings;
const afterCountry = applyLocks(unlocked, { ...unlocked, country: "NP", countryLocked: true });
assert.equal(afterCountry.country, "NP"); // first change goes through
assert.equal(afterCountry.countryLocked, true);
const retry = applyLocks(afterCountry, { ...afterCountry, country: "AU", countryLocked: false }); // second change refused
assert.equal(retry.country, "NP");
assert.equal(retry.countryLocked, true);
const fy = { start: "2026-10-01", end: "2027-09-30" };
const afterFy = applyLocks(afterCountry, { ...afterCountry, fiscalYearCustom: fy, fiscalYearLocked: true });
assert.deepEqual(afterFy.fiscalYearCustom, fy);
const fyRetry = applyLocks(afterFy, { ...afterFy, fiscalYearCustom: { start: "2026-01-01", end: "2026-12-31" }, fiscalYearLocked: false });
assert.deepEqual(fyRetry.fiscalYearCustom, fy);
assert.equal(fyRetry.fiscalYearLocked, true);
assert.equal(applyLocks(afterFy, { ...afterFy, companyName: "New Co" }).companyName, "New Co"); // other settings still editable

// ---- labels, rolling, custom fiscal year ----
assert.equal(fiscalYearLabel({ start: "2026-07-16", end: "2027-07-15" }), "FY 2026/27");
assert.equal(fiscalYearLabel({ start: "2026-01-01", end: "2026-12-31" }), "FY 2026");
const custom = { start: "2026-07-16", end: "2027-07-15" };
assert.deepEqual(rollFiscalYear(custom, "2028-03-01"), { start: "2027-07-16", end: "2028-07-15" });
assert.deepEqual(rollFiscalYear(custom, "2025-09-01"), { start: "2025-07-16", end: "2026-07-15" });
assert.deepEqual(shiftFiscalYear({ start: "2027-03-01", end: "2028-02-29" }, 1), { start: "2028-03-01", end: "2029-02-28" });
assert.equal(validateFiscalYear({ start: "2026-07-16", end: "2027-07-15" }), null);
assert.match(validateFiscalYear({ start: "2026-07-16", end: "2026-07-15" }) ?? "", /before/);
assert.match(validateFiscalYear({ start: "", end: "2026-07-15" }) ?? "", /start/);

// ---- presets (today = 2026-09-30, Nepal FY) ----
const today = "2026-09-30";
const fiscalYear = { start: "2026-07-16", end: "2027-07-15" };
const p = (preset: Parameters<typeof resolvePeriod>[0], c?: { start: string; end: string }) =>
  resolvePeriod(preset, { today, fiscalYear, custom: c });
assert.deepEqual(p("this-month"), { startIso: "2026-09-01", endIso: "2026-09-30", label: "This Month" });
assert.deepEqual(p("last-month"), { startIso: "2026-08-01", endIso: "2026-08-31", label: "Last Month" });
assert.deepEqual(p("this-fiscal-year"), { startIso: "2026-07-16", endIso: "2027-07-15", label: "FY 2026/27" });
assert.deepEqual(p("last-fiscal-year"), { startIso: "2025-07-16", endIso: "2026-07-15", label: "FY 2025/26" });
assert.deepEqual(p("this-quarter"), { startIso: "2026-07-16", endIso: "2026-10-15", label: "Q1 · FY 2026/27" });
assert.equal(resolvePeriod("this-quarter", { today: "2027-05-01", fiscalYear }).endIso, "2027-07-15"); // Q4 capped at FY end
assert.deepEqual(resolvePeriod("last-month", { today: "2026-01-10", fiscalYear }), {
  startIso: "2025-12-01",
  endIso: "2025-12-31",
  label: "Last Month",
});
const c = p("custom", { start: "2026-01-01", end: "2026-03-31" });
assert.equal(c.label, "Jan 1, 2026 – Mar 31, 2026");
assert.equal(c.label, formatSpan("2026-01-01", "2026-03-31"));

// ---- the filter: inclusive at both ends ----
const tx = (id: string, date: string, type: Transaction["type"], amount: number, status: Transaction["status"] = "Completed"): Transaction => ({
  id,
  date,
  description: id,
  category: "Sales",
  type,
  status,
  amount,
});
const all: Transaction[] = [
  tx("a", "2025-12-31", "Income", 1000),
  tx("b", "2026-01-01", "Income", 2000),
  tx("c", "2026-02-15", "Expense", 500),
  tx("d", "2026-03-31", "Income", 4000, "Pending"),
  tx("e", "2026-04-01", "Expense", 700),
];
const q1 = { startIso: "2026-01-01", endIso: "2026-03-31" };
assert.deepEqual(filterByRange(all, q1).map((t) => t.id), ["b", "c", "d"]);
assert.deepEqual(rangeToQuery(q1), { startDate: "2026-01-01", endDate: "2026-03-31" });

// ---- everything downstream reacts to the period ----
const meta = { fileName: "t.csv", duplicateCount: 0, totalTransactions: all.length };
const dQ1 = buildCsvDataset(filterByRange(all, q1), { ...meta, period: { label: "Q1", ...q1 }, includeForecast: false });
const dAll = buildCsvDataset(all, meta);
const revenue = (d: typeof dQ1) => d.snapshot.find((m) => m.key === "revenue")!.value;
const cash = (d: typeof dQ1) => d.snapshot.find((m) => m.key === "cash")!.value;
assert.equal(revenue(dQ1), 6000);
assert.equal(cash(dQ1), 5500);
assert.equal(revenue(dAll), 7000);
assert.equal(dQ1.transactions.length, 3);
assert.equal(dQ1.totalTransactions, 5);
assert.equal(dQ1.period?.label, "Q1");
assert.equal(dQ1.reports.monthly.length, 3); // Jan, Feb, Mar only
assert.equal(dQ1.ask.pending.total, 4000); // only in-period pending income
assert.equal(dQ1.cashSeries.some((r) => r.forecast != null), false); // ended period → no projection
assert.equal(dAll.cashSeries.some((r) => r.forecast != null), true);

// Data exists but none in the period → zeros + a clear note, not a crash.
const none = buildCsvDataset([], { ...meta, period: { label: "Last Month", startIso: "2026-08-01", endIso: "2026-08-31" } });
assert.equal(revenue(none), 0);
assert.match(none.snapshotNote ?? "", /No transactions fall within Last Month/);
assert.match(none.reports.note ?? "", /No transactions fall within/);

console.log(`date-range checks passed (TZ=${process.env.TZ ?? "system"})`);
