// PHASE 1 MOCK DATA — reports. Statements are derived from these inputs in
// lib/reports.ts so KPIs, chart and statements always agree.
import { financialSummary } from "@/data/mock-finance";

export const monthlyPerformance = [
  { month: "Apr", revenue: 180_000, expenses: 125_000 },
  { month: "May", revenue: 190_000, expenses: 130_000 },
  { month: "Jun", revenue: 200_000, expenses: 138_000 },
  { month: "Jul", revenue: 215_000, expenses: 141_000 },
  { month: "Aug", revenue: 225_000, expenses: 148_000 },
  { month: "Sep", revenue: 230_000, expenses: 160_000 },
];

// Shares of period totals (each list sums to 1).
export const revenueMix = [
  { label: "Product sales", share: 0.62 },
  { label: "Services", share: 0.21 },
  { label: "Other income", share: 0.17 },
];

export const expenseMix = [
  { label: "Cost of goods sold", share: 0.38, group: "cogs" },
  { label: "Payroll", share: 0.27, group: "opex" },
  { label: "Marketing", share: 0.1, group: "opex" },
  { label: "Rent & utilities", share: 0.09, group: "opex" },
  { label: "Software", share: 0.06, group: "opex" },
  { label: "Other operating", share: 0.1, group: "opex" },
] as const;

export interface CashFlowLine {
  label: string;
  amount?: number;
  source?: "netProfit";
}

export const cashFlowStatement: { section: string; lines: CashFlowLine[] }[] = [
  {
    section: "Operating activities",
    lines: [
      { label: "Net profit", source: "netProfit" },
      { label: "Change in receivables", amount: -18_400 },
      { label: "Change in payables", amount: 12_000 },
    ],
  },
  { section: "Investing activities", lines: [{ label: "Equipment purchases", amount: -45_000 }] },
  {
    section: "Financing activities",
    lines: [
      { label: "Loan repayments", amount: -30_000 },
      { label: "Owner contribution", amount: 20_000 },
    ],
  },
];
export const openingCash = 150_000;

export const balanceSheet = {
  assets: [
    { label: "Cash", amount: financialSummary.cash },
    { label: "Accounts receivable", amount: financialSummary.receivables },
    { label: "Inventory", amount: 210_000 },
    { label: "Equipment", amount: 340_000 },
  ],
  liabilities: [
    { label: "Accounts payable", amount: financialSummary.payables },
    { label: "Loans", amount: 180_000 },
    { label: "Accrued expenses", amount: 32_000 },
  ],
};

export const reportTabs = ["Profit & Loss", "Cash Flow", "Balance Sheet"] as const;
export type ReportTab = (typeof reportTabs)[number];
