// Deterministic report calculations over the active dataset's ReportInputs.
import { round2 } from "@/lib/format";
import type { ReportInputs } from "@/lib/dataset/types";

export interface StatementRow {
  label: string;
  amount?: number;
  kind: "section" | "line" | "subtotal" | "total";
}

const sum = (xs: number[]) => round2(xs.reduce((a, b) => a + b, 0));

export function periodTotals(r: ReportInputs) {
  const revenue = sum(r.monthly.map((m) => m.revenue));
  const expenses = sum(r.monthly.map((m) => m.expenses));
  const netProfit = round2(revenue - expenses);
  return { revenue, expenses, netProfit, margin: revenue ? (netProfit / revenue) * 100 : 0 };
}

export function latestMonthChange(r: ReportInputs) {
  if (r.monthly.length < 2) return null;
  const [prev, last] = r.monthly.slice(-2);
  const pct = (a: number, b: number) => (a === 0 ? null : ((b - a) / a) * 100);
  return {
    month: last.month,
    prevMonth: prev.month,
    revenuePct: pct(prev.revenue, last.revenue),
    expensesPct: pct(prev.expenses, last.expenses),
  };
}

function change(label: string, pct: number | null, up: string, down: string) {
  if (pct === null) return `${label} had no prior-month figure to compare against.`;
  if (Math.abs(pct) < 1) return `${label} remained stable compared with the previous month.`;
  return `${label} ${pct > 0 ? up : down} ${Math.abs(pct).toFixed(1)}% compared with the previous month.`;
}

export function aiSummary(r: ReportInputs): string[] {
  if (r.monthly.length === 0) return ["No data yet — upload a CSV or connect an API to generate a summary."];
  const c = latestMonthChange(r);
  const t = periodTotals(r);
  const lines = c
    ? [change("Revenue", c.revenuePct, "increased", "decreased"), change("Operating expenses", c.expensesPct, "rose", "fell")]
    : ["Only one month of data is available, so there is no month-over-month comparison."];
  lines.push(`Net profit margin for the period is ${t.margin.toFixed(1)}%.`);
  return lines;
}

export function profitAndLossRows(r: ReportInputs): StatementRow[] {
  const { netProfit } = periodTotals(r);
  const totalRevenue = sum(r.revenueLines.map((l) => l.amount));
  const cogsLines = r.expenseLines.filter((e) => e.group === "cogs");
  const opex = r.expenseLines.filter((e) => e.group === "opex");
  const cogs = sum(cogsLines.map((e) => e.amount));
  const totalOpex = sum(opex.map((e) => e.amount));
  return [
    { label: "Revenue", kind: "section" },
    ...r.revenueLines.map((l): StatementRow => ({ ...l, kind: "line" })),
    { label: "Total revenue", amount: totalRevenue, kind: "subtotal" },
    ...(cogsLines.length
      ? [
          { label: "Cost of goods sold", amount: -cogs, kind: "line" } as StatementRow,
          { label: "Gross profit", amount: round2(totalRevenue - cogs), kind: "subtotal" } as StatementRow,
        ]
      : []),
    { label: "Operating expenses", kind: "section" },
    ...opex.map((e): StatementRow => ({ label: e.label, amount: -e.amount, kind: "line" })),
    { label: "Total operating expenses", amount: -totalOpex, kind: "subtotal" },
    { label: "Net profit", amount: netProfit, kind: "total" },
  ];
}

export function cashFlowRows(r: ReportInputs): StatementRow[] {
  const { netProfit } = periodTotals(r);
  const rows: StatementRow[] = [];
  let net = 0;
  for (const s of r.cashFlow) {
    rows.push({ label: s.section, kind: "section" });
    for (const l of s.lines) {
      const amount = l.source === "netProfit" ? netProfit : (l.amount ?? 0);
      net = round2(net + amount);
      rows.push({ label: l.label, amount, kind: "line" });
    }
  }
  rows.push({ label: "Net change in cash", amount: net, kind: "subtotal" });
  rows.push({ label: "Opening cash", amount: r.openingCash, kind: "line" });
  rows.push({ label: "Closing cash", amount: round2(r.openingCash + net), kind: "total" });
  return rows;
}

export function balanceSheetRows(r: ReportInputs): StatementRow[] {
  const assets = sum(r.balanceSheet.assets.map((a) => a.amount));
  const liabilities = sum(r.balanceSheet.liabilities.map((l) => l.amount));
  return [
    { label: "Assets", kind: "section" },
    ...r.balanceSheet.assets.map((a): StatementRow => ({ ...a, kind: "line" })),
    { label: "Total assets", amount: assets, kind: "subtotal" },
    { label: "Liabilities", kind: "section" },
    ...r.balanceSheet.liabilities.map((l): StatementRow => ({ ...l, kind: "line" })),
    { label: "Total liabilities", amount: liabilities, kind: "subtotal" },
    { label: "Owner's equity (assets − liabilities)", amount: round2(assets - liabilities), kind: "total" },
  ];
}
