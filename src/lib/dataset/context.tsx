"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";

import { Transaction, TransactionStatus, TransactionType } from "@/data/mock-transactions";
import type { CsvAnalysis } from "@/lib/csv/analyze";
import { buildCsvDataset, buildEmptyDataset } from "@/lib/dataset/from-transactions";
import type { Dataset } from "@/lib/dataset/types";
import { useFinancialDateRange, useToday } from "@/lib/date-range/context";
import { filterByRange } from "@/lib/date-range/filter";
import { createPersistentStore } from "@/lib/persistent-store";

// Uploaded data is cached in this browser TAB only (sessionStorage): it survives
// navigation and refresh, and disappears when the tab is closed. Never sent anywhere.
const store = createPersistentStore("session", "finance-os:dataset:v1");

// Compact row: [id, date, description, category, type(0=Income,1=Expense), status(0=Completed,1=Pending), amount]
type StoredRow = [string, string, string, string, 0 | 1, 0 | 1, number];
interface StoredCsv {
  v: 1;
  fileName: string;
  fileSizeBytes: number;
  duplicateCount: number;
  rows: StoredRow[];
}

const TYPES: TransactionType[] = ["Income", "Expense"];
const STATUSES: TransactionStatus[] = ["Completed", "Pending"];

function parseStored(raw: string | null): StoredCsv | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as StoredCsv;
    if (p.v !== 1 || !Array.isArray(p.rows) || typeof p.fileName !== "string") return null;
    const ok = p.rows.every(
      (r) =>
        Array.isArray(r) &&
        r.length === 7 &&
        typeof r[0] === "string" &&
        typeof r[1] === "string" &&
        typeof r[2] === "string" &&
        typeof r[3] === "string" &&
        (r[4] === 0 || r[4] === 1) &&
        (r[5] === 0 || r[5] === 1) &&
        typeof r[6] === "number",
    );
    return ok ? p : null;
  } catch {
    return null;
  }
}

const toRows = (list: Transaction[]): StoredRow[] =>
  list.map((t) => [t.id, t.date, t.description, t.category, t.type === "Income" ? 0 : 1, t.status === "Completed" ? 0 : 1, t.amount]);

const fromRows = (rows: StoredRow[]): Transaction[] =>
  rows.map(([id, date, description, category, type, status, amount]) => ({
    id,
    date,
    description,
    category,
    type: TYPES[type],
    status: STATUSES[status],
    amount,
  }));

interface DatasetApi {
  /** Built from the transactions inside the selected reporting period only. */
  dataset: Dataset;
  /** Every transaction held, regardless of the selected period. */
  allTransactions: Transaction[];
  fileSizeBytes: number;
  /** Cache a validated CSV. Returns whether it could also be persisted for page refreshes. */
  applyCsv: (analysis: CsvAnalysis) => { persisted: boolean };
  clearCsv: () => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
}

const Ctx = createContext<DatasetApi | null>(null);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const stored = useMemo(() => parseStored(raw), [raw]);
  // No CSV uploaded yet: start empty, not demo numbers — every page shows 0 until real data exists.
  const [manualList, setManualList] = useState<Transaction[]>([]);

  // The ONE place the global reporting period is applied. Everything downstream (dashboard KPIs,
  // charts, transactions list, cash flow, reports, Ask Finance) is built from `inPeriod`, so no page
  // can show a different period from any other.
  const range = useFinancialDateRange();
  const today = useToday();
  const allTransactions = useMemo(() => (stored ? fromRows(stored.rows) : manualList), [stored, manualList]);

  const dataset = useMemo(() => {
    if (allTransactions.length === 0) return buildEmptyDataset();
    const inPeriod = filterByRange(allTransactions, range);
    const dates = allTransactions.map((t) => t.date).sort();
    return buildCsvDataset(inPeriod, {
      fileName: stored ? stored.fileName : "Manually added transactions",
      duplicateCount: stored ? stored.duplicateCount : 0,
      period: { label: range.label, startIso: range.startIso, endIso: range.endIso },
      totalTransactions: allTransactions.length,
      dataBounds: { start: dates[0], end: dates[dates.length - 1] },
      // Only project forward if the period hasn't ended yet.
      includeForecast: range.endIso >= today,
    });
  }, [allTransactions, stored, range, today]);

  const applyCsv = useCallback((analysis: CsvAnalysis) => {
    const list: Transaction[] = analysis.transactions.map((t) => ({
      id: `csv-${t.row}`,
      date: t.date,
      description: t.description,
      category: t.category,
      type: t.type,
      status: t.status,
      amount: t.amountMinor / 100,
    }));
    const payload: StoredCsv = {
      v: 1,
      fileName: analysis.fileName,
      fileSizeBytes: analysis.fileSizeBytes,
      duplicateCount: analysis.transactions.filter((t) => t.duplicateOf !== undefined).length,
      rows: toRows(list),
    };
    return { persisted: store.set(JSON.stringify(payload)) };
  }, []);

  const clearCsv = useCallback(() => {
    store.set(null);
  }, []);

  const addTransaction = useCallback(
    (t: Omit<Transaction, "id">) => {
      const tx: Transaction = { ...t, id: `t-${Date.now()}` };
      if (stored) store.set(JSON.stringify({ ...stored, rows: [...toRows([tx]), ...stored.rows] } satisfies StoredCsv));
      else setManualList((prev) => [tx, ...prev]);
    },
    [stored],
  );

  const value = useMemo(
    () => ({ dataset, allTransactions, fileSizeBytes: stored?.fileSizeBytes ?? 0, applyCsv, clearCsv, addTransaction }),
    [dataset, allTransactions, stored, applyCsv, clearCsv, addTransaction],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useApi() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Dataset hooks must be used within DatasetProvider");
  return ctx;
}

export const useDataset = () => useApi().dataset;
export const useDatasetActions = () => {
  const { applyCsv, clearCsv, addTransaction, fileSizeBytes } = useApi();
  return { applyCsv, clearCsv, addTransaction, fileSizeBytes };
};

/** All transactions ignoring the reporting period (e.g. for defaults in the "add transaction" form). */
export const useAllTransactions = () => useApi().allTransactions;
