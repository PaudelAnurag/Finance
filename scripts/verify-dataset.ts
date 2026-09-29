// Run: npx tsx scripts/verify-dataset.ts
// Proves every page's numbers derive from the uploaded CSV and reconcile with each other.
import assert from "node:assert/strict";

import { sampleCsvRows } from "../src/data/mock-upload";
import { analyzeCsv, buildCsv } from "../src/lib/csv/analyze";
import { balanceSheetRows, cashFlowRows, periodTotals, profitAndLossRows, aiSummary } from "../src/lib/reports";
import { latestActual, netChange, projectedRunoutMonth } from "../src/lib/cash-flow";
import { buildCsvDataset, buildEmptyDataset } from "../src/lib/dataset/from-transactions";
import { transactions as sampleTx } from "../src/data/mock-transactions";
import { renderMoneyTokens } from "../src/lib/format";
import { summarize } from "../src/lib/transactions";

const H = "date,description,category,type,amount,status";
const csv = [
  H,
  "2025-08-05,Customer A,Sales,Income,100000,Completed",
  "2025-08-10,Rent,Operations,Expense,30000.50,Completed",
  "2025-08-20,AWS,Software,Expense,10000,Completed",
  "2025-09-03,Customer B,Sales,Income,150000,Completed",
  "2025-09-04,Customer C,Services,Income,20000,Pending",
  "2025-09-08,Rent,Operations,Expense,30000.50,Completed",
  "2025-09-12,Payroll,Payroll,Expense,60000,Pending",
  "2025-09-15,Payroll,Payroll,Expense,60000,Pending",
].join("\n");

const toDataset = (text: string) => {
  const a = analyzeCsv(text, { fileName: "t.csv", fileSizeBytes: text.length });
  assert.equal(a.issues.filter((i) => i.severity === "error").length, 0);
  const tx = a.transactions.map((t) => ({
    id: `csv-${t.row}`, date: t.date, description: t.description, category: t.category,
    type: t.type, status: t.status, amount: t.amountMinor / 100,
  }));
  return { a, ds: buildCsvDataset(tx, { fileName: "t.csv", duplicateCount: a.transactions.filter((t) => t.duplicateOf).length }) };
};

let n = 0;
const ok = (name: string, fn: () => void) => { fn(); n++; console.log("✓", name); };

const { a, ds } = toDataset(csv);
const snap = Object.fromEntries(ds.snapshot.map((m) => [m.key, m]));

ok("snapshot figures equal the CSV totals exactly", () => {
  assert.equal(snap.revenue.value, 270000);
  assert.equal(snap.cash.value, 270000 - 30000.5 - 10000 - 30000.5 - 120000);
  assert.equal(snap.receivables.value, 20000);
  assert.equal(snap.payables.value, 120000);
  assert.equal(a.summary.netMinor / 100, snap.cash.value);
});

ok("month-over-month deltas come from the last two months", () => {
  // Aug income 100000 -> Sep 170000 = +70%
  assert.equal(Math.round((snap.revenue.delta as { value: number }).value), 70);
  assert.equal(ds.reports.monthly.length, 2);
});

ok("cash series is cumulative net + 3-month projection", () => {
  const actual = ds.cashSeries.filter((p) => p.actual !== undefined);
  assert.equal(actual.length, 2);
  assert.equal(actual[0].actual, 59999.5); // Aug net
  assert.equal(latestActual(ds.cashSeries)!.actual, snap.cash.value);
  assert.equal(ds.cashSeries.filter((p) => p.forecast !== undefined).length, 4); // anchor + 3
  assert.equal(netChange(ds.cashSeries), (snap.cash.value as number) - 59999.5);
  assert.equal(projectedRunoutMonth(ds.cashSeries), null); // average monthly net is positive -> no runout
});

ok("reports reconcile: P&L net profit == cash-flow net == balance-sheet equity == snapshot cash", () => {
  const t = periodTotals(ds.reports);
  assert.equal(t.revenue, 270000);
  assert.equal(t.expenses, 190001); // 30000.50 + 10000 + 30000.50 + 120000
  const net = t.netProfit;
  const pnl = profitAndLossRows(ds.reports).find((r) => r.label === "Net profit")!.amount;
  const cf = cashFlowRows(ds.reports).find((r) => r.label === "Closing cash")!.amount;
  const bs = balanceSheetRows(ds.reports).find((r) => r.label.startsWith("Owner"))!.amount;
  assert.equal(pnl, net);
  assert.equal(cf, net);
  assert.equal(bs, net);
  assert.equal(net, snap.cash.value);
  assert.ok(!profitAndLossRows(ds.reports).some((r) => r.label === "Gross profit"), "no fake COGS for CSV");
});

ok("category lines sum to totals", () => {
  const rev = ds.reports.revenueLines.reduce((s, l) => s + l.amount, 0);
  const exp = ds.reports.expenseLines.reduce((s, l) => s + l.amount, 0);
  assert.equal(Math.round(rev * 100), 27000000);
  assert.equal(Math.round(exp * 100), Math.round((30000.5 + 10000 + 30000.5 + 120000) * 100));
});

ok("Ask Finance data: latest-month revenue, delta, pending list, expense deltas", () => {
  const r = ds.ask.revenue;
  assert.equal(r.total, 170000);
  assert.equal(r.previous, 100000);
  assert.equal(Math.round(r.deltaPct!), 70);
  assert.deepEqual(r.bySource.map((s) => s.label).sort(), ["Sales", "Services"]);
  assert.equal(ds.ask.pending.mode, "pending");
  assert.equal(ds.ask.pending.total, 20000);
  assert.deepEqual(ds.ask.pending.items.map((i) => i.name), ["Customer C"]);
  const rent = ds.ask.expenses.items.find((e) => e.category === "Operations")!;
  assert.equal(rent.amount, 30000.5);
  assert.equal(rent.deltaFromPrior, 0);
  const payroll = ds.ask.expenses.items.find((e) => e.category === "Payroll")!;
  assert.equal(payroll.deltaFromPrior, 120000);
  assert.equal(ds.ask.expenses.hasPrior, true);
});

ok("attention + quick insights are derived and tokenised", () => {
  const ids = ds.attention.map((x) => x.id);
  assert.ok(ids.includes("pending-receivables") && ids.includes("pending-payables"));
  const rendered = renderMoneyTokens(ds.attention.find((x) => x.id === "pending-receivables")!.text, "USD");
  assert.equal(rendered, "USD 20.0k pending income");
  assert.equal(ds.quickInsights.length, 4);
  assert.ok(ds.quickInsights.every((q) => q.question.length > 0));
});

ok("single-month CSV: no crashes, no fake comparisons", () => {
  const one = toDataset(`${H}\n2025-09-01,A,Sales,Income,100,Completed\n2025-09-02,B,Rent,Expense,40,Completed\n`).ds;
  assert.equal(one.snapshot.find((m) => m.key === "revenue")!.delta, null);
  assert.equal(one.ask.revenue.previous, null);
  assert.equal(one.ask.revenue.deltaPct, null);
  assert.equal(one.ask.expenses.hasPrior, false);
  assert.match(aiSummary(one.reports)[0], /Only one month/);
  assert.equal(one.snapshot.find((m) => m.key === "runway")!.kind, "text");
});

ok("runway: text when not burning, months when burning", () => {
  const healthy = toDataset(`${H}\n2025-01-01,Seed,Sales,Income,1000,Completed\n2025-01-02,Rent,Ops,Expense,300,Completed\n2025-02-01,Rent,Ops,Expense,400,Completed\n`).ds;
  assert.equal(healthy.snapshot.find((m) => m.key === "runway")!.kind, "text"); // net +300, not burning
  const real = toDataset(`${H}\n2025-01-01,Seed,Sales,Income,100,Completed\n2025-01-02,Rent,Ops,Expense,300,Completed\n2025-02-01,Rent,Ops,Expense,400,Completed\n`).ds;
  const r2 = real.snapshot.find((m) => m.key === "runway")!;
  assert.equal(r2.kind, "months"); // net -600 over 2 months: burning
  assert.equal(r2.value, 0); // cash already negative -> 0 months left
});

ok("sample CSV dataset totals match the Transactions page mock", () => {
  const { ds: s } = toDataset(buildCsv(sampleCsvRows));
  const t = summarize(sampleTx);
  assert.equal(s.snapshot.find((m: { key: string }) => m.key === "revenue")!.value, t.income);
  assert.equal(s.transactions.length, sampleTx.length);
});

ok("empty dataset (no upload yet): every number is 0 / empty, nothing crashes", () => {
  const d = buildEmptyDataset();
  assert.equal(d.source, "empty");
  assert.equal(d.fileName, null);
  assert.equal(d.transactions.length, 0);
  assert.deepEqual(
    d.snapshot.map((m: { value: number | string }) => m.value),
    [0, 0, 0, "Not burning cash", 0, 0],
  );
  assert.ok(d.snapshot.every((m: { delta: unknown }) => m.delta === null));
  assert.equal(d.attention.length, 0);
  assert.equal(d.quickInsights.length, 4);
  assert.equal(d.ask.revenue.total, 0);
  assert.equal(d.ask.revenue.previous, null);
  assert.equal(d.ask.pending.items.length, 0);
  assert.equal(periodTotals(d.reports).revenue, 0);
  assert.equal(periodTotals(d.reports).netProfit, 0);
});

console.log(`\n${n} groups passed`);
