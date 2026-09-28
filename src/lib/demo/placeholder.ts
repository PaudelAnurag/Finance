// PHASE 1 PLACEHOLDER DATA — UI shell only.
// Replaced in phase 2 by the demo financial dataset + deterministic finance engine.
// Nothing here is an "answer"; do not build features on top of it.

export const snapshot = [
  { label: "Revenue", value: "£1.24m", delta: "+6.2%", direction: "up" as const },
  { label: "Cash", value: "£84.2k", delta: "-9.1%", direction: "down" as const },
  { label: "Gross margin", value: "42.1%", delta: "-1.4 pts", direction: "down" as const },
  { label: "Runway", value: "5.8 mo", delta: "-0.6 mo", direction: "down" as const },
  { label: "Receivables", value: "£126k", delta: "+£18.4k", direction: "down" as const },
  { label: "Payables", value: "£91k", delta: "+2.0%", direction: "up" as const },
];

export const attention = [
  { severity: "high" as const, text: "3 unusual transactions" },
  { severity: "medium" as const, text: "£18,400 overdue receivables" },
  { severity: "medium" as const, text: "Cash forecast deteriorated" },
  { severity: "low" as const, text: "VAT anomaly detected" },
];

export const cashSeries = [
  { month: "Apr", actual: 132, forecast: null },
  { month: "May", actual: 121, forecast: null },
  { month: "Jun", actual: 118, forecast: null },
  { month: "Jul", actual: 104, forecast: null },
  { month: "Aug", actual: 93, forecast: null },
  { month: "Sep", actual: 84.2, forecast: 84.2 },
  { month: "Oct", actual: null, forecast: 76 },
  { month: "Nov", actual: null, forecast: 69 },
  { month: "Dec", actual: null, forecast: 58 },
  { month: "Jan", actual: null, forecast: 51 },
];

export const quickInsights = [
  { tone: "green" as const, title: "Revenue increased", detail: "+6.2% compared to last month" },
  { tone: "red" as const, title: "Expenses increased", detail: "+3.4% compared to last month" },
  { tone: "blue" as const, title: "Cash position healthy", detail: "NPR 84.2k available" },
  { tone: "orange" as const, title: "2 overdue invoices", detail: "Total outstanding: NPR 18.4k" },
];

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
  { label: "Product Sales", pct: 62, value: "NPR 0.77m", tone: "blue" as const },
  { label: "Services", pct: 21, value: "NPR 0.26m", tone: "purple" as const },
  { label: "Other Income", pct: 12, value: "NPR 0.15m", tone: "green" as const },
  { label: "Discounts", pct: 5, value: "NPR 0.06m", tone: "orange" as const },
];

export const revenueTrend = [
  { month: "Nov", value: 0.95 },
  { month: "Dec", value: 1.05 },
  { month: "Jan", value: 0.82 },
  { month: "Feb", value: 0.98 },
  { month: "Mar", value: 1.17 },
  { month: "Apr", value: 1.24 },
];
