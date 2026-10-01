// Checks the shared building blocks every ingestion path relies on:
// validators (CSV / API / Add-transaction form), money math, and the date helpers.
import assert from "node:assert/strict";

import { addMonthsToYearMonth, formatShortDate, formatYearMonth } from "../src/lib/date-range/dates";
import { fromMinor, pctChange, round2, toMinor } from "../src/lib/money";
import { validateAmount, validateDate, validateRecord } from "../src/lib/records/validate";

let groups = 0;
function ok(name: string, fn: () => void) {
  fn();
  groups++;
  console.log(`✓ ${name}`);
}

ok("money: minor/major round-trip never drifts", () => {
  assert.equal(toMinor(0.1) + toMinor(0.2), toMinor(0.3));
  assert.equal(toMinor(1.15), 115);
  assert.equal(fromMinor(115), 1.15);
  assert.equal(round2(2.005 + 0.001), 2.01);
});

ok("money: pctChange has no result without a prior figure and uses |prev| for the base", () => {
  assert.equal(pctChange(0, 50), null);
  assert.equal(pctChange(100, 150), 50);
  assert.equal(pctChange(-100, -50), 50);
});

ok("validateDate: real calendar dates only (the one rule CSV, API and the form share)", () => {
  assert.deepEqual(validateDate(" 2026-02-28 "), { value: "2026-02-28" });
  assert.ok("error" in validateDate("2026-02-30"));
  assert.ok("error" in validateDate("26-02-28"));
  assert.deepEqual(validateDate(""), { error: "Missing date" });
});

ok("validateAmount: exact minor units, positive, max 2 decimals", () => {
  assert.deepEqual(validateAmount("1,234.50"), { minor: 123450 });
  assert.deepEqual(validateAmount("1.15"), { minor: 115 });
  assert.ok("error" in validateAmount("-5"));
  assert.ok("error" in validateAmount("1.234"));
  assert.ok("error" in validateAmount("0"));
  assert.ok("error" in validateAmount("abc"));
});

ok("validateRecord: collects every error in a stable order; custom type words work", () => {
  const bad = validateRecord(() => "");
  assert.ok("errors" in bad && bad.errors.length === 6);
  const good = validateRecord(
    (f) => ({ date: "2026-01-05", description: "Rent", category: "Ops", type: "debit", amount: "10", status: "pending" })[f],
    { incomeWord: "credit", expenseWord: "debit" },
  );
  assert.ok("record" in good);
  if ("record" in good) assert.deepEqual(good.record, { date: "2026-01-05", description: "Rent", category: "Ops", type: "Expense", status: "Pending", amountMinor: 1000 });
});

ok("dates: month helpers cross year boundaries and format in UTC", () => {
  assert.equal(addMonthsToYearMonth("2026-11", 3), "2027-02");
  assert.equal(addMonthsToYearMonth("2026-01", 0), "2026-01");
  assert.equal(formatYearMonth("2026-01"), "Jan 2026");
  assert.equal(formatShortDate("2026-01-05"), "Jan 5");
});

console.log(`\n${groups} groups passed`);
