// Demo dataset: assembled from the existing mock modules (unchanged numbers).
import { askQuestions } from "@/data/ask-finance-qa";
import {
  attention,
  cashFlowData,
  financialSummary,
  financialSummaryDeltas,
  overdueInvoices,
  quickInsights,
  revenueBySource,
  revenueTrend,
  topExpenses,
} from "@/data/mock-finance";
import { balanceSheet, cashFlowStatement, expenseMix, monthlyPerformance, openingCash, revenueMix } from "@/data/mock-reports";
import type { Transaction } from "@/data/mock-transactions";
import { latestActual, netChange, worstMonthDrop } from "@/lib/cash-flow";
import type { CashPoint, Dataset } from "@/lib/dataset/types";
import { moneyToken, round2 } from "@/lib/format";

const insightQuestions = [askQuestions.revenue, askQuestions.expenses, askQuestions.cashflow, askQuestions.overdue];

export function buildDemoDataset(transactions: Transaction[]): Dataset {
  const cashSeries: CashPoint[] = cashFlowData.map((p) => ({ ...p }));
  const d = financialSummaryDeltas;
  const revenueTotal = revenueBySource.reduce((s, r) => s + r.value, 0);
  const periodRevenue = monthlyPerformance.reduce((s, m) => s + m.revenue, 0);
  const periodExpenses = monthlyPerformance.reduce((s, m) => s + m.expenses, 0);
  const overdueTotal = overdueInvoices.reduce((s, i) => s + i.amount, 0);

  return {
    source: "demo",
    fileName: null,
    snapshot: [
      { key: "revenue", label: "Revenue", kind: "money", value: financialSummary.revenue, delta: d.revenue },
      { key: "cash", label: "Cash", kind: "money", value: financialSummary.cash, delta: d.cash },
      { key: "margin", label: "Gross margin", kind: "pct", value: financialSummary.grossMarginPct, delta: d.grossMarginPct },
      { key: "runway", label: "Runway", kind: "months", value: financialSummary.runwayMonths, delta: d.runwayMonths },
      { key: "receivables", label: "Receivables", kind: "money", value: financialSummary.receivables, delta: d.receivables },
      { key: "payables", label: "Payables", kind: "money", value: financialSummary.payables, delta: d.payables },
    ],
    snapshotNote: null,
    cashSeries,
    cashNote: null,
    attention: attention.map((a) => ({
      id: a.id,
      severity: a.severity,
      text: "amount" in a ? `${moneyToken(a.amount)} ${a.text}` : a.text,
      detail: a.detail,
    })),
    quickInsights: quickInsights.map((q, i) => ({
      tone: q.tone,
      title: q.title,
      detail: "amount" in q ? `${moneyToken(q.amount)} ${q.amountSuffix}` : q.detail,
      question: insightQuestions[i],
    })),
    transactions,
    reports: {
      monthly: monthlyPerformance,
      revenueLines: revenueMix.map((r) => ({ label: r.label, amount: Math.round(r.share * periodRevenue) })),
      expenseLines: expenseMix.map((e) => ({ label: e.label, group: e.group, amount: Math.round(e.share * periodExpenses) })),
      cashFlow: cashFlowStatement,
      openingCash,
      balanceSheet,
      note: null,
    },
    ask: {
      revenue: {
        periodLabel: "last month",
        total: revenueTotal,
        previous: revenueTrend[revenueTrend.length - 2].value,
        deltaPct: d.revenue.value,
        trend: revenueTrend,
        bySource: revenueBySource.map((r) => ({ ...r })),
      },
      cash: {
        latest: latestActual(cashSeries)?.actual ?? 0,
        change: netChange(cashSeries),
        deltaPct: d.cash.value,
        worstMonth: worstMonthDrop(cashSeries),
        receivables: financialSummary.receivables,
      },
      pending: {
        mode: "overdue",
        total: round2(overdueTotal),
        items: overdueInvoices.map((i) => ({ name: i.customer, amount: i.amount, detail: `${i.daysOverdue} days overdue` })),
      },
      expenses: { periodLabel: "last month", hasPrior: true, items: topExpenses.map((e) => ({ ...e })) },
    },
  };
}
