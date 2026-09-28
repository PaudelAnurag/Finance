// PHASE 1 MOCK DATA — the only place UI numbers live.
// Components import from here and format via src/lib/format.ts; never hardcode
// a display string like "NPR 1.24m" inside a component.
//
// PHASE 1
// mock-finance.ts
//       ↓
//    Frontend
//
// Phase 2 swaps this file for the deterministic finance engine reading real
// accounting data — component code should not need to change.
import type { Delta } from "@/lib/format";

export const financialSummary = {
  revenue: 0,
  cash: 0,
  grossMarginPct: 0,
  runwayMonths: 0,
  receivables: 0,
  payables: 0,
};

export const financialSummaryDeltas: Record<keyof typeof financialSummary, Delta> = {
  revenue: { type: "pct", value: 0 },
  cash: { type: "pct", value: 0 },
  grossMarginPct: { type: "pts", value: 0 },
  runwayMonths: { type: "months", value: 0 },
  receivables: { type: "currency", value: 0 },
  payables: { type: "pct", value: 0 },
};

export const cashFlowData = [
  { month: "Apr", actual: 0 },
  { month: "May", actual: 0 },
  { month: "Jun", actual: 0 },
  { month: "Jul", actual: 0 },
  { month: "Aug", actual: 0 },
  { month: "Sep", actual: 0, forecast: 0 },
  { month: "Oct", forecast: 0 },
  { month: "Nov", forecast: 0 },
  { month: "Dec", forecast: 0 },
  { month: "Jan", forecast: 0 },
] satisfies { month: string; actual?: number; forecast?: number }[];

export const overdueInvoices = [
  { customer: "Bright Hardware Co.", amount: 0, daysOverdue: 0 },
  { customer: "Northgate Traders", amount: 0, daysOverdue: 0 },
] as const;

export const attention = [
  {
    id: "unusual-txn",
    severity: "high",
    text: "0 unusual transactions",
    detail: "Large transaction detected on Apr 18",
  },
  {
    id: "overdue-ar",
    severity: "medium",
    text: "overdue receivables",
    amount: financialSummaryDeltas.receivables.value,
    detail: "0 customers are past due",
  },
  {
    id: "cash-forecast",
    severity: "medium",
    text: "Cash forecast deteriorated",
    detail: "Runway reduced by 0 months",
  },
  {
    id: "vat-anomaly",
    severity: "low",
    text: "VAT anomaly detected",
    detail: "Mismatch in April VAT filing",
  },
] as const;

export const quickInsights = [
  {
    tone: "green",
    title: "Revenue increased",
    detail: "0% compared to last month",
  },
  {
    tone: "red",
    title: "Expenses increased",
    detail: "0% compared to last month",
  },
  {
    tone: "blue",
    title: "Cash position healthy",
    amount: financialSummary.cash,
    amountSuffix: "available",
  },
  {
    tone: "orange",
    title: `${overdueInvoices.length} overdue invoices`,
    amount: overdueInvoices.reduce((sum, i) => sum + i.amount, 0),
    amountSuffix: "outstanding",
  },
] as const;

export const recentQuestions = [
  { text: "What was our total revenue last month?", time: "Apr 30, 10:24 AM" },
  { text: "Why did our cash balance decrease?", time: "Apr 29, 2:15 PM" },
  { text: "Which customers have overdue invoices?", time: "Apr 28, 11:32 AM" },
  { text: "How is our cash flow forecast looking?", time: "Apr 27, 9:45 AM" },
];

export const suggestedQuestions = [
  "How is our cash flow looking?",
  "What are our top expenses?",
  "Which customers are overdue?",
  "Can we afford to hire next month?",
];

export const revenueBySource = [
  { label: "Product Sales", value: 0, tone: "blue" },
  { label: "Services", value: 0, tone: "purple" },
  { label: "Other Income", value: 0, tone: "green" },
  { label: "Discounts", value: 0, tone: "orange" },
] as const;

export const revenueTrend = [
  { month: "Nov", value: 0 },
  { month: "Dec", value: 0 },
  { month: "Jan", value: 0 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Apr", value: 0 },
];

export const topExpenses = [
  { category: "Payroll", amount: 0, deltaFromPrior: 0 },
  { category: "Software", amount: 0, deltaFromPrior: 0 },
  { category: "Marketing", amount: 0, deltaFromPrior: 0 },
  { category: "Rent", amount: 0, deltaFromPrior: 0 },
  { category: "Logistics", amount: 0, deltaFromPrior: 0 },
] as const;