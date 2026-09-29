// Tab labels only — the numbers behind each tab come from the active Dataset
// (src/lib/dataset), not from this file.
export const reportTabs = ["Profit & Loss", "Cash Flow", "Balance Sheet"] as const;
export type ReportTab = (typeof reportTabs)[number];
