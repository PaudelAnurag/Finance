// Pure, deterministic CSV analysis. No React, no network, no storage.
// All money is handled as integer MINOR units (x100) so totals never drift.
import { csvSpec } from "@/data/mock-upload";
import { parseCsv } from "@/lib/csv/parse";
import { validateRecord, type TxStatus, type TxType } from "@/lib/records/validate";

export interface ParsedTransaction {
  row: number; // line in the file
  date: string;
  description: string;
  category: string;
  type: TxType;
  status: TxStatus;
  amountMinor: number;
  duplicateOf?: number;
}

export interface RowIssue {
  row: number | null; // null = header / file level
  severity: "error" | "warning";
  message: string;
}

export interface CategoryTotal {
  category: string;
  type: TxType;
  totalMinor: number;
  count: number;
}

export interface MonthlyTotal {
  month: string; // yyyy-mm
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  cumulativeMinor: number;
}

export interface Summary {
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  incomeCount: number;
  expenseCount: number;
  pendingIncomeMinor: number;
  pendingExpenseMinor: number;
  categories: CategoryTotal[];
  monthly: MonthlyTotal[];
}

export interface Check {
  label: string;
  passed: boolean;
  detail?: string;
}

export interface CsvAnalysis {
  fileName: string;
  fileSizeBytes: number;
  fatalError: string | null;
  headerOk: boolean;
  missingColumns: string[];
  extraColumns: string[];
  totalDataRows: number; // every record below the header, blank ones included
  blankRows: number;
  validRows: number;
  invalidRows: number;
  issues: RowIssue[];
  transactions: ParsedTransaction[];
  summary: Summary;
  checks: Check[];
}

const REQUIRED = csvSpec.requiredColumns.map((c) => c.name);

function emptySummary(): Summary {
  return {
    incomeMinor: 0,
    expenseMinor: 0,
    netMinor: 0,
    incomeCount: 0,
    expenseCount: 0,
    pendingIncomeMinor: 0,
    pendingExpenseMinor: 0,
    categories: [],
    monthly: [],
  };
}

export function summarize(transactions: ParsedTransaction[]): Summary {
  const s = emptySummary();
  const cats = new Map<string, CategoryTotal>();
  const months = new Map<string, MonthlyTotal>();

  for (const t of transactions) {
    const income = t.type === "Income";
    if (income) {
      s.incomeMinor += t.amountMinor;
      s.incomeCount++;
      if (t.status === "Pending") s.pendingIncomeMinor += t.amountMinor;
    } else {
      s.expenseMinor += t.amountMinor;
      s.expenseCount++;
      if (t.status === "Pending") s.pendingExpenseMinor += t.amountMinor;
    }

    const ckey = `${t.type}|${t.category.toLowerCase()}`;
    const c = cats.get(ckey) ?? { category: t.category, type: t.type, totalMinor: 0, count: 0 };
    c.totalMinor += t.amountMinor;
    c.count++;
    cats.set(ckey, c);

    const mkey = t.date.slice(0, 7);
    const m = months.get(mkey) ?? { month: mkey, incomeMinor: 0, expenseMinor: 0, netMinor: 0, cumulativeMinor: 0 };
    if (income) m.incomeMinor += t.amountMinor;
    else m.expenseMinor += t.amountMinor;
    months.set(mkey, m);
  }

  s.netMinor = s.incomeMinor - s.expenseMinor;
  s.categories = [...cats.values()].sort((a, b) => b.totalMinor - a.totalMinor);
  let running = 0;
  s.monthly = [...months.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => {
      m.netMinor = m.incomeMinor - m.expenseMinor;
      running += m.netMinor;
      m.cumulativeMinor = running;
      return m;
    });
  return s;
}

/** Independent recomputation so the accuracy panel proves the numbers, not just repeats them. */
export function buildChecks(a: Omit<CsvAnalysis, "checks">): Check[] {
  const { summary: s, transactions: tx } = a;
  const signedSum = tx.reduce((sum, t) => sum + (t.type === "Income" ? t.amountMinor : -t.amountMinor), 0);
  const catIncome = s.categories.filter((c) => c.type === "Income").reduce((n, c) => n + c.totalMinor, 0);
  const catExpense = s.categories.filter((c) => c.type === "Expense").reduce((n, c) => n + c.totalMinor, 0);
  const monthlyNet = s.monthly.reduce((n, m) => n + m.netMinor, 0);
  const accounted = a.validRows + a.invalidRows + a.blankRows;

  return [
    { label: "Every CSV row is accounted for (valid + invalid + blank)", passed: accounted === a.totalDataRows, detail: `${accounted} of ${a.totalDataRows}` },
    { label: "Income + expense transactions equal valid rows", passed: s.incomeCount + s.expenseCount === a.validRows },
    { label: "Net cash flow equals income − expenses", passed: s.netMinor === s.incomeMinor - s.expenseMinor && s.netMinor === signedSum },
    { label: "Category totals reconcile to income and expenses", passed: catIncome === s.incomeMinor && catExpense === s.expenseMinor },
    { label: "Monthly totals reconcile to net cash flow", passed: monthlyNet === s.netMinor },
    {
      label: "All totals are within safe numeric range",
      passed: [s.incomeMinor, s.expenseMinor, s.netMinor].every(Number.isSafeInteger),
    },
  ];
}

export function base(meta: { fileName: string; fileSizeBytes: number }): Omit<CsvAnalysis, "checks"> {
  return {
    fileName: meta.fileName,
    fileSizeBytes: meta.fileSizeBytes,
    fatalError: null,
    headerOk: false,
    missingColumns: [],
    extraColumns: [],
    totalDataRows: 0,
    blankRows: 0,
    validRows: 0,
    invalidRows: 0,
    issues: [],
    transactions: [],
    summary: emptySummary(),
  };
}

export function fatal(meta: { fileName: string; fileSizeBytes: number }, message: string, extra: Partial<CsvAnalysis> = {}): CsvAnalysis {
  return { ...base(meta), fatalError: message, checks: [], ...extra };
}

export function analyzeCsv(text: string, meta: { fileName: string; fileSizeBytes: number }): CsvAnalysis {
  const parsed = parseCsv(text);
  if (parsed.error) return fatal(meta, parsed.error.message);
  if (parsed.records.length === 0 || text.trim() === "") return fatal(meta, "The file is empty.");

  const headerRec = parsed.records[0];
  const headers = headerRec.cells.map((h) => h.trim().toLowerCase());

  if (headers.length === 1 && /[;\t|]/.test(headers[0])) {
    return fatal(meta, "This file does not look comma-separated. Export it as a comma-delimited CSV.");
  }
  const dupes = headers.filter((h, i) => h && headers.indexOf(h) !== i);
  if (dupes.length) return fatal(meta, `Duplicate column name: ${[...new Set(dupes)].join(", ")}.`);

  const missingColumns = REQUIRED.filter((c) => !headers.includes(c));
  const extraColumns = headers.filter((h) => h && !REQUIRED.includes(h as (typeof REQUIRED)[number]));
  if (missingColumns.length) {
    return fatal(meta, `Missing required column${missingColumns.length > 1 ? "s" : ""}: ${missingColumns.join(", ")}.`, {
      missingColumns,
      extraColumns,
    });
  }

  const dataRecords = parsed.records.slice(1);
  if (dataRecords.length === 0) {
    return fatal(meta, "No data rows found below the header.", { headerOk: true, extraColumns });
  }

  const idx = Object.fromEntries(REQUIRED.map((c) => [c, headers.indexOf(c)])) as Record<(typeof REQUIRED)[number], number>;
  const result = base(meta);
  result.headerOk = true;
  result.extraColumns = extraColumns;
  result.totalDataRows = dataRecords.length;
  if (extraColumns.length) {
    result.issues.push({ row: null, severity: "warning", message: `Extra columns ignored: ${extraColumns.join(", ")}` });
  }

  const seen = new Map<string, number>();

  for (const rec of dataRecords) {
    const row = rec.line;
    const cells = [...rec.cells];
    while (cells.length > headers.length && cells[cells.length - 1].trim() === "") cells.pop();

    if (cells.every((c) => c.trim() === "")) {
      result.blankRows++;
      result.issues.push({ row, severity: "warning", message: "Empty row skipped" });
      continue;
    }
    if (cells.length !== headers.length) {
      result.invalidRows++;
      result.issues.push({ row, severity: "error", message: `Expected ${headers.length} columns but found ${cells.length}` });
      continue;
    }

    // Same validators as the API import and the "Add transaction" form.
    const outcome = validateRecord((f) => cells[idx[f]], { incomeWord: "Income", expenseWord: "Expense" });
    if ("errors" in outcome) {
      result.invalidRows++;
      for (const message of outcome.errors) result.issues.push({ row, severity: "error", message });
      continue;
    }

    const r = outcome.record;
    const tx: ParsedTransaction = { row, ...r };
    const key = [r.date, r.description.toLowerCase(), r.category.toLowerCase(), r.type, r.amountMinor].join("|");
    const first = seen.get(key);
    if (first !== undefined) {
      tx.duplicateOf = first;
      result.issues.push({ row, severity: "warning", message: `Possible duplicate of row ${first} (still included in totals)` });
    } else {
      seen.set(key, row);
    }
    result.transactions.push(tx);
    result.validRows++;
  }

  result.summary = summarize(result.transactions);
  return { ...result, checks: buildChecks(result) };
}

export function buildCsv(rows: string[][], header: string[] = REQUIRED as string[]) {
  const esc = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n";
}
