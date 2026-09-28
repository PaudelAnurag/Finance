// Run: npx tsx scripts/verify-csv.ts
import assert from "node:assert/strict";

import { sampleCsvRows, sampleCsvWithErrors } from "../src/data/mock-upload";
import { transactions } from "../src/data/mock-transactions";
import { analyzeCsv, buildCsv } from "../src/lib/csv/analyze";
import { parseCsv } from "../src/lib/csv/parse";
import { summarize } from "../src/lib/transactions";

const meta = { fileName: "t.csv", fileSizeBytes: 1 };
const H = "date,description,category,type,amount,status";
let n = 0;
const ok = (name: string, fn: () => void) => { fn(); n++; console.log("✓", name); };

ok("parser: quotes, commas, escaped quotes, CRLF, BOM, trailing newline", () => {
  const r = parseCsv('\uFEFFa,b\r\n"x, y","say ""hi"""\r\n');
  assert.deepEqual(r.records.map((x) => x.cells), [["a", "b"], ["x, y", 'say "hi"']]);
});

ok("parser: multi-line quoted field keeps true file line numbers", () => {
  const r = parseCsv('h\n"line1\nline2"\nnext\n');
  assert.deepEqual(r.records.map((x) => x.line), [1, 2, 4]);
});

ok("parser: unterminated quote is reported", () => {
  assert.ok(parseCsv('a\n"oops').error);
});

ok("valid file: exact totals, commas in amounts, decimals, quoted description", () => {
  const a = analyzeCsv(
    `${H}\r\n2025-09-25,"Smith, Jones & Co",Sales,Income,"85,000",Completed\r\n2025-09-24,Rent,Operations,expense,12400.50,pending\r\n`,
    meta,
  );
  assert.equal(a.fatalError, null);
  assert.equal(a.validRows, 2);
  assert.equal(a.summary.incomeMinor, 8_500_000);
  assert.equal(a.summary.expenseMinor, 1_240_050);
  assert.equal(a.summary.netMinor, 8_500_000 - 1_240_050);
  assert.equal(a.summary.pendingExpenseMinor, 1_240_050);
  assert.ok(a.checks.every((c) => c.passed));
});

ok("no floating point drift: 0.10 + 0.20 = 0.30 exactly", () => {
  const a = analyzeCsv(`${H}\n2025-01-01,a,X,Income,0.10,Completed\n2025-01-02,b,X,Income,0.20,Completed\n`, meta);
  assert.equal(a.summary.incomeMinor, 30);
});

ok("bad rows: correct file row numbers and messages", () => {
  const a = analyzeCsv(sampleCsvWithErrors, meta);
  const errs = a.issues.filter((i) => i.severity === "error").map((i) => `${i.row}:${i.message}`);
  assert.deepEqual(errs, [
    '4:Invalid amount: "abc"',
    "5:Missing date",
    '6:Invalid type: "refund" (expected Income or Expense)',
  ]);
  assert.equal(a.validRows, 4);
  assert.equal(a.invalidRows, 3);
  const dup = a.issues.find((i) => i.message.startsWith("Possible duplicate"));
  assert.equal(dup?.row, 8);
  assert.match(dup!.message, /row 7/);
  assert.ok(a.checks.every((c) => c.passed), "reconciliation still holds with invalid rows excluded");
});

ok("validators: impossible date, negative, zero, 3 decimals, bad status, blank row, wrong column count", () => {
  const a = analyzeCsv(
    [H, "2025-02-30,a,X,Income,5,Completed", "2025-01-01,b,X,Income,-5,Completed", "2025-01-01,c,X,Income,0,Completed",
     "2025-01-01,d,X,Income,1.234,Completed", "2025-01-01,e,X,Income,5,Done", ",,,,,", "2025-01-01,f,X,Income", ""].join("\n"),
    meta,
  );
  const msgs = a.issues.map((i) => i.message);
  assert.ok(msgs.some((m) => m.startsWith('Invalid date: "2025-02-30"')));
  assert.ok(msgs.some((m) => m.startsWith("Amount must be positive")));
  assert.ok(msgs.some((m) => m.startsWith("Amount must be greater than 0")));
  assert.ok(msgs.some((m) => m.includes("maximum 2 decimal places")));
  assert.ok(msgs.some((m) => m.startsWith('Invalid status: "Done"')));
  assert.ok(msgs.includes("Empty row skipped"));
  assert.ok(msgs.includes("Expected 6 columns but found 4"));
  assert.equal(a.validRows, 0);
  assert.equal(a.blankRows, 1);
  assert.equal(a.totalDataRows, a.validRows + a.invalidRows + a.blankRows);
});

ok("structure: missing column, duplicate header, empty file, header only, wrong delimiter", () => {
  assert.match(analyzeCsv("date,amount\n2025-01-01,5\n", meta).fatalError!, /Missing required columns: description, category, type, status/);
  assert.match(analyzeCsv(`${H},amount\n`, meta).fatalError!, /Duplicate column/);
  assert.match(analyzeCsv("", meta).fatalError!, /empty/);
  assert.match(analyzeCsv(`${H}\n`, meta).fatalError!, /No data rows/);
  assert.match(analyzeCsv("date;description;category;type;amount;status\n", meta).fatalError!, /comma-separated/);
});

ok("header matching is case/space tolerant and extra columns only warn", () => {
  const a = analyzeCsv(" Date , Description,CATEGORY,Type,Amount,Status,Notes\n2025-01-01,a,X,Income,5,Completed,hi\n", meta);
  assert.equal(a.validRows, 1);
  assert.ok(a.issues.some((i) => i.severity === "warning" && i.message.includes("notes")));
});

ok("round trip: sample CSV totals == Transactions page mock totals", () => {
  const a = analyzeCsv(buildCsv(sampleCsvRows), meta);
  const t = summarize(transactions);
  assert.equal(a.invalidRows, 0);
  assert.equal(a.summary.incomeMinor, t.income * 100);
  assert.equal(a.summary.expenseMinor, t.expenses * 100);
  assert.equal(a.validRows, transactions.length);
});

ok("category + monthly grouping (case-insensitive categories)", () => {
  const a = analyzeCsv(`${H}\n2025-08-31,a,Software,Expense,10,Completed\n2025-09-01,b,software,Expense,5,Completed\n2025-09-02,c,Sales,Income,100,Completed\n`, meta);
  const sw = a.summary.categories.find((c) => c.category.toLowerCase() === "software")!;
  assert.equal(sw.totalMinor, 1500);
  assert.equal(a.summary.monthly.length, 2);
  assert.equal(a.summary.monthly[0].netMinor, -1000); // Aug: -10.00
  assert.equal(a.summary.monthly[1].netMinor, 9500); // Sep: +100.00 - 5.00
  assert.equal(a.summary.monthly[1].cumulativeMinor, 8500); // 85.00
});

console.log(`\n${n} groups passed`);
