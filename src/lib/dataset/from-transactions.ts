// Derives EVERY dashboard figure from a list of transactions (the uploaded CSV).
// Deterministic; money handled in integer minor units; nothing hardcoded.
import type { Transaction } from "@/data/mock-transactions";
import { askQuestions } from "@/data/ask-finance-qa";
import { latestActual, netChange, worstMonthDrop } from "@/lib/cash-flow";
import type { AskData, AttentionItem, CashPoint, Dataset, QuickInsight, SnapshotMetric, Tone } from "@/lib/dataset/types";
import { moneyToken, round2 } from "@/lib/format";
import { formatMonth, formatShortDate, toMinor } from "@/lib/transactions";

const TONES: Tone[] = ["blue", "purple", "green", "orange", "teal"];
const FORECAST_MONTHS = 3;

interface Bucket {
  income: number;
  expense: number;
  incomeCats: Map<string, { label: string; total: number }>;
  expenseCats: Map<string, { label: string; total: number }>;
}

const pctChange = (prev: number, cur: number) => (prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100);
const major = (minor: number) => round2(minor / 100);

function addTo(map: Bucket["incomeCats"], category: string, minor: number) {
  const key = category.toLowerCase();
  const cur = map.get(key) ?? { label: category, total: 0 };
  cur.total += minor;
  map.set(key, cur);
}

function nextMonth(ym: string, k: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + k, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const sortedCats = (map: Bucket["incomeCats"]) => [...map.values()].sort((a, b) => b.total - a.total);

export function buildCsvDataset(
  transactions: Transaction[],
  meta: { fileName: string; duplicateCount: number },
): Dataset {
  const buckets = new Map<string, Bucket>();
  let incomeMinor = 0;
  let expenseMinor = 0;
  let pendingIncome = 0;
  let pendingExpense = 0;
  let pendingIncomeCount = 0;
  let pendingExpenseCount = 0;
  const incomeAll = new Map<string, { label: string; total: number }>();
  const expenseAll = new Map<string, { label: string; total: number }>();

  for (const t of transactions) {
    const m = toMinor(t.amount);
    const key = t.date.slice(0, 7);
    const b = buckets.get(key) ?? { income: 0, expense: 0, incomeCats: new Map(), expenseCats: new Map() };
    if (t.type === "Income") {
      b.income += m;
      incomeMinor += m;
      addTo(b.incomeCats, t.category, m);
      addTo(incomeAll, t.category, m);
      if (t.status === "Pending") {
        pendingIncome += m;
        pendingIncomeCount++;
      }
    } else {
      b.expense += m;
      expenseMinor += m;
      addTo(b.expenseCats, t.category, m);
      addTo(expenseAll, t.category, m);
      if (t.status === "Pending") {
        pendingExpense += m;
        pendingExpenseCount++;
      }
    }
    buckets.set(key, b);
  }

  const months = [...buckets.keys()].sort();
  const netMinor = incomeMinor - expenseMinor;
  const last = buckets.get(months[months.length - 1]);
  const prev = months.length > 1 ? buckets.get(months[months.length - 2]) : undefined;

  // ---- cash series: cumulative net (zero opening balance) + simple projection ----
  let running = 0;
  const cumulative: number[] = [];
  const cashSeries: CashPoint[] = months.map((ym) => {
    const b = buckets.get(ym)!;
    running += b.income - b.expense;
    cumulative.push(running);
    return { month: formatMonth(ym), actual: major(running) };
  });
  const window = Math.min(3, months.length);
  const avgNetMinor =
    months.slice(-window).reduce((s, ym) => s + (buckets.get(ym)!.income - buckets.get(ym)!.expense), 0) / Math.max(window, 1);
  if (months.length) {
    cashSeries[cashSeries.length - 1].forecast = cashSeries[cashSeries.length - 1].actual;
    for (let k = 1; k <= FORECAST_MONTHS; k++) {
      cashSeries.push({ month: formatMonth(nextMonth(months[months.length - 1], k)), forecast: major(running + avgNetMinor * k) });
    }
  }

  // ---- snapshot ----
  const marginOf = (inc: number, exp: number) => (inc > 0 ? ((inc - exp) / inc) * 100 : null);
  const margin = marginOf(incomeMinor, expenseMinor) ?? 0;
  const lastMargin = last ? marginOf(last.income, last.expense) : null;
  const prevMargin = prev ? marginOf(prev.income, prev.expense) : null;
  const revenuePct = prev && last ? pctChange(prev.income, last.income) : null;
  const cashPct = cumulative.length > 1 ? pctChange(cumulative[cumulative.length - 2], cumulative[cumulative.length - 1]) : null;
  const avgMonthlyNet = months.length ? netMinor / months.length : 0;
  const runway: SnapshotMetric =
    avgMonthlyNet >= 0
      ? { key: "runway", label: "Runway", kind: "text", value: "Not burning cash", delta: null }
      : { key: "runway", label: "Runway", kind: "months", value: Math.max(running, 0) / -avgMonthlyNet, delta: null };

  const snapshot: SnapshotMetric[] = [
    { key: "revenue", label: "Revenue", kind: "money", value: major(incomeMinor), delta: revenuePct === null ? null : { type: "pct", value: revenuePct } },
    { key: "cash", label: "Net cash", kind: "money", value: major(running), delta: cashPct === null ? null : { type: "pct", value: cashPct } },
    {
      key: "margin",
      label: "Net margin",
      kind: "pct",
      value: margin,
      delta: lastMargin !== null && prevMargin !== null ? { type: "pts", value: lastMargin - prevMargin } : null,
    },
    runway,
    { key: "receivables", label: "Pending income", kind: "money", value: major(pendingIncome), delta: null },
    { key: "payables", label: "Pending expenses", kind: "money", value: major(pendingExpense), delta: null },
  ];

  // ---- attention (deterministic rules) ----
  const attention: AttentionItem[] = [];
  const stats = (type: Transaction["type"]) => {
    const list = transactions.filter((t) => t.type === type);
    const mean = list.length ? list.reduce((s, t) => s + t.amount, 0) / list.length : 0;
    return { list, mean };
  };
  const unusual = (["Income", "Expense"] as const).flatMap((type) => {
    const { list, mean } = stats(type);
    return list.length >= 5 ? list.filter((t) => t.amount > mean * 2) : [];
  });
  if (unusual.length) {
    const biggest = [...unusual].sort((a, b) => b.amount - a.amount)[0];
    attention.push({
      id: "unusual-txn",
      severity: "high",
      text: `${unusual.length} unusually large transaction${unusual.length === 1 ? "" : "s"}`,
      detail: `Largest: ${biggest.description} (${moneyToken(biggest.amount)}) on ${formatShortDate(biggest.date)}`,
    });
  }
  if (last && last.income - last.expense < 0) {
    attention.push({
      id: "negative-month",
      severity: "medium",
      text: `Net cash flow negative in ${formatMonth(months[months.length - 1])}`,
      detail: `${moneyToken(major(last.income - last.expense))} for the month`,
    });
  }
  if (avgNetMinor < 0) {
    attention.push({
      id: "cash-forecast",
      severity: "medium",
      text: "Cash forecast is declining",
      detail: `Average monthly net: ${moneyToken(major(avgNetMinor))}`,
    });
  }
  if (pendingIncome > 0) {
    attention.push({
      id: "pending-receivables",
      severity: "medium",
      text: `${moneyToken(major(pendingIncome))} pending income`,
      detail: `${pendingIncomeCount} income transaction${pendingIncomeCount === 1 ? "" : "s"} still pending`,
    });
  }
  if (pendingExpense > 0) {
    attention.push({
      id: "pending-payables",
      severity: "low",
      text: `${moneyToken(major(pendingExpense))} pending expenses`,
      detail: `${pendingExpenseCount} expense transaction${pendingExpenseCount === 1 ? "" : "s"} still pending`,
    });
  }
  if (meta.duplicateCount > 0) {
    attention.push({
      id: "duplicates",
      severity: "low",
      text: `${meta.duplicateCount} possible duplicate transaction${meta.duplicateCount === 1 ? "" : "s"}`,
      detail: "Flagged while checking your upload",
    });
  }

  // ---- quick insights ----
  const expensePct = prev && last ? pctChange(prev.expense, last.expense) : null;
  const trendInsight = (label: string, pct: number | null, total: number, upGood: boolean, question: string): QuickInsight => {
    if (pct === null) return { tone: "blue", title: label, detail: `${moneyToken(major(total))} in the latest month`, question };
    const up = pct >= 0;
    return {
      tone: up === upGood ? "green" : "red",
      title: `${label} ${up ? "increased" : "decreased"}`,
      detail: `${up ? "+" : ""}${pct.toFixed(1)}% compared to last month`,
      question,
    };
  };
  const quickInsights: QuickInsight[] = [
    trendInsight("Revenue", revenuePct, last?.income ?? 0, true, askQuestions.revenue),
    trendInsight("Expenses", expensePct, last?.expense ?? 0, false, askQuestions.expenses),
    {
      tone: running >= 0 ? "blue" : "red",
      title: running >= 0 ? "Net cash is positive" : "Net cash is negative",
      detail: `${moneyToken(major(running))} cumulative net cash flow`,
      question: askQuestions.cashflow,
    },
    pendingIncomeCount > 0
      ? {
          tone: "orange",
          title: `${pendingIncomeCount} pending income item${pendingIncomeCount === 1 ? "" : "s"}`,
          detail: `${moneyToken(major(pendingIncome))} outstanding`,
          question: askQuestions.overdue,
        }
      : { tone: "green", title: "No pending income", detail: "Nothing outstanding in your data", question: askQuestions.overdue },
  ];

  // ---- reports inputs ----
  const reports: Dataset["reports"] = {
    monthly: months.map((ym) => ({
      month: formatMonth(ym),
      revenue: major(buckets.get(ym)!.income),
      expenses: major(buckets.get(ym)!.expense),
    })),
    revenueLines: sortedCats(incomeAll).map((c) => ({ label: c.label, amount: major(c.total) })),
    expenseLines: sortedCats(expenseAll).map((c) => ({ label: c.label, amount: major(c.total), group: "opex" as const })),
    cashFlow: [
      {
        section: "Operating activities",
        lines: [
          { label: "Income (all rows)", amount: major(incomeMinor) },
          { label: "Expenses (all rows)", amount: -major(expenseMinor) },
        ],
      },
    ],
    openingCash: 0,
    balanceSheet: { assets: [{ label: "Cash (cumulative net cash flow)", amount: major(running) }], liabilities: [] },
    note:
      "Built from your uploaded transactions. Cost of goods sold isn't in a transactions CSV, so all expenses are shown as operating expenses; opening cash is assumed to be zero and the balance sheet shows cash only.",
  };

  // ---- ask data ----
  const latestCash = latestActual(cashSeries)?.actual ?? 0;
  const lastIncomeCats = last ? sortedCats(last.incomeCats) : [];
  const revenueAsk: AskData["revenue"] = {
    periodLabel: months.length ? formatMonth(months[months.length - 1]) : "the latest month",
    total: major(last?.income ?? 0),
    previous: prev ? major(prev.income) : null,
    deltaPct: revenuePct,
    trend: months.map((ym) => ({ month: formatMonth(ym), value: major(buckets.get(ym)!.income) })),
    bySource: lastIncomeCats.map((c, i) => ({ label: c.label, value: major(c.total), tone: TONES[i % TONES.length] })),
  };
  const pendingItems = transactions
    .filter((t) => t.type === "Income" && t.status === "Pending")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
    .map((t) => ({ name: t.description, amount: t.amount, detail: `Dated ${formatShortDate(t.date)}` }));
  const expenseItems = last
    ? sortedCats(last.expenseCats).map((c) => ({
        category: c.label,
        amount: major(c.total),
        deltaFromPrior: prev ? major(c.total - (prev.expenseCats.get(c.label.toLowerCase())?.total ?? 0)) : 0,
      }))
    : [];

  return {
    source: "csv",
    fileName: meta.fileName,
    snapshot,
    snapshotNote:
      "Net cash = cumulative net of all rows (pending included), assuming zero opening balance. Pending income/expenses stand in for receivables/payables. Percent changes compare the last two months.",
    cashSeries,
    cashNote: `Forecast = latest net cash plus the average monthly net of the last ${window} month${window === 1 ? "" : "s"}, projected ${FORECAST_MONTHS} months ahead.`,
    attention,
    quickInsights,
    transactions,
    reports,
    ask: {
      revenue: revenueAsk,
      cash: {
        latest: latestCash,
        change: netChange(cashSeries),
        deltaPct: cashPct,
        worstMonth: worstMonthDrop(cashSeries),
        receivables: major(pendingIncome),
      },
      pending: { mode: "pending", total: major(pendingIncome), items: pendingItems },
      expenses: { periodLabel: revenueAsk.periodLabel, hasPrior: months.length > 1, items: expenseItems },
    },
  };
}
