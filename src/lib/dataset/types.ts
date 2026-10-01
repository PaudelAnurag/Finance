import type { Transaction } from "@/data/mock-transactions";
import type { Delta } from "@/lib/format";

export type Tone = "blue" | "green" | "red" | "purple" | "orange" | "teal";

/** Text fields may contain `{m:123}` money tokens (see lib/format renderMoneyTokens). */
export interface SnapshotMetric {
  key: "revenue" | "cash" | "margin" | "runway" | "receivables" | "payables";
  label: string;
  kind: "money" | "pct" | "months" | "text";
  value: number | string;
  delta: Delta | null;
}

export interface CashPoint {
  month: string;
  actual?: number;
  forecast?: number;
}

export interface AttentionItem {
  id: string;
  severity: "high" | "medium" | "low";
  text: string;
  detail: string;
}

export interface QuickInsight {
  tone: Tone;
  title: string;
  detail: string;
  question: string;
}

export interface ReportInputs {
  monthly: { month: string; revenue: number; expenses: number }[];
  revenueLines: { label: string; amount: number }[];
  expenseLines: { label: string; amount: number; group: "cogs" | "opex" }[];
  cashFlow: { section: string; lines: { label: string; amount?: number; source?: "netProfit" }[] }[];
  openingCash: number;
  balanceSheet: {
    assets: { label: string; amount: number }[];
    liabilities: { label: string; amount: number }[];
  };
  note: string | null;
}

export interface AskData {
  revenue: {
    periodLabel: string;
    total: number;
    previous: number | null;
    deltaPct: number | null;
    trend: { month: string; value: number }[];
    bySource: { label: string; value: number; tone: Tone }[];
  };
  cash: {
    latest: number;
    change: number;
    deltaPct: number | null;
    worstMonth: { month: string; change: number; changePct: number | null } | null;
    receivables: number;
  };
  pending: {
    mode: "overdue" | "pending";
    total: number;
    items: { name: string; amount: number; detail: string }[];
  };
  expenses: {
    periodLabel: string;
    hasPrior: boolean;
    items: { category: string; amount: number; deltaFromPrior: number }[];
  };
}

/** The reporting period the dataset was built for (null when there is no data yet). */
export interface DatasetPeriod {
  label: string;
  startIso: string;
  endIso: string;
}

export interface Dataset {
  source: "csv" | "empty";
  fileName: string | null;
  /** The selected reporting period. Every figure below covers only this period. */
  period: DatasetPeriod | null;
  /** Transactions held in total, before the period filter (`transactions` is the filtered list). */
  totalTransactions: number;
  /** Earliest / latest transaction date held in total, for "show all data" shortcuts. */
  dataBounds: { start: string; end: string } | null;
  snapshot: SnapshotMetric[];
  snapshotNote: string | null;
  cashSeries: CashPoint[];
  cashNote: string | null;
  attention: AttentionItem[];
  quickInsights: QuickInsight[];
  transactions: Transaction[];
  reports: ReportInputs;
  ask: AskData;
}
