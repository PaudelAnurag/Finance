// Run: npx tsx scripts/verify-json-import.ts
import assert from "node:assert/strict";

import { jsonToCsv } from "../src/lib/csv/from-json";
import { analyzeCsv } from "../src/lib/csv/analyze";
import { buildCsvDataset } from "../src/lib/dataset/from-transactions";

let n = 0;
const ok = (name: string, fn: () => void) => { fn(); n++; console.log("✓", name); };

ok("plain array of objects with alias keys converts and validates", () => {
  const payload = [
    { txnDate: "2025-09-01", memo: "Customer A", categoryName: "Sales", transactionType: "Income", amt: "1000", state: "Completed" },
    { txnDate: "2025-09-05", memo: "Rent", categoryName: "Ops", transactionType: "expense", amt: 300, state: "pending" },
  ];
  const { csv, error } = jsonToCsv(payload);
  assert.equal(error, null);
  const a = analyzeCsv(csv!, { fileName: "api", fileSizeBytes: 1 });
  assert.equal(a.validRows, 2);
  assert.equal(a.summary.incomeMinor, 100000);
  assert.equal(a.summary.expenseMinor, 30000);
});

ok("wrapped { transactions: [...] } response is unwrapped", () => {
  const { csv, error } = jsonToCsv({
    transactions: [{ date: "2025-09-01", description: "A", category: "Sales", type: "Income", amount: 50, status: "Completed" }],
  });
  assert.equal(error, null);
  assert.equal(analyzeCsv(csv!, { fileName: "api", fileSizeBytes: 1 }).validRows, 1);
});

ok("wrapped { data: [...] } response is unwrapped", () => {
  const { csv, error } = jsonToCsv({
    data: [{ date: "2025-09-01", description: "A", category: "Sales", type: "Income", amount: 50, status: "Completed" }],
  });
  assert.equal(error, null);
  assert.equal(analyzeCsv(csv!, { fileName: "api", fileSizeBytes: 1 }).validRows, 1);
});

ok("non-array, non-object payload is rejected", () => {
  assert.match(jsonToCsv("just a string").error!, /JSON array/);
  assert.match(jsonToCsv(42).error!, /JSON array/);
});

ok("empty array is rejected with a clear message", () => {
  assert.match(jsonToCsv([]).error!, /zero transactions/);
});

ok("array of non-objects is rejected", () => {
  assert.match(jsonToCsv([1, 2, 3]).error!, /transaction object/);
});

ok("missing fields become blank cells, still row-numbered by analyzeCsv", () => {
  const { csv } = jsonToCsv([{ description: "No date here", amount: 5 }]);
  const a = analyzeCsv(csv!, { fileName: "api", fileSizeBytes: 1 });
  assert.equal(a.validRows, 0);
  assert.ok(a.issues.some((i) => i.message === "Missing date"));
  assert.ok(a.issues.some((i) => i.message === "Missing category"));
});

ok("end-to-end: API JSON -> dataset numbers, same engine as CSV", () => {
  const payload = [
    { date: "2025-08-01", description: "Sale", category: "Sales", type: "Income", amount: 200, status: "Completed" },
    { date: "2025-08-02", description: "Rent", category: "Ops", type: "Expense", amount: 50, status: "Completed" },
  ];
  const { csv } = jsonToCsv(payload);
  const a = analyzeCsv(csv!, { fileName: "api", fileSizeBytes: 1 });
  const tx = a.transactions.map((t) => ({
    id: `csv-${t.row}`, date: t.date, description: t.description, category: t.category,
    type: t.type, status: t.status, amount: t.amountMinor / 100,
  }));
  const ds = buildCsvDataset(tx, { fileName: "API: example.com", duplicateCount: 0 });
  assert.equal(ds.snapshot.find((m) => m.key === "revenue")!.value, 200);
  assert.equal(ds.fileName, "API: example.com");
});

console.log(`\n${n} groups passed`);
