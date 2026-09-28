"use client";

import { ArrowDownRight, ArrowUpRight, PiggyBank, Percent, Sparkles } from "lucide-react";
import { useState } from "react";

import { RevenueExpensesChart } from "@/components/reports/revenue-expenses-chart";
import { AppShell } from "@/components/shell/app-shell";
import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { ReportTab, reportTabs } from "@/data/mock-reports";
import { useMoney } from "@/lib/currency";
import { useDataset } from "@/lib/dataset/context";
import { formatPct } from "@/lib/format";
import {
  StatementRow,
  aiSummary,
  balanceSheetRows,
  cashFlowRows,
  periodTotals,
  profitAndLossRows,
} from "@/lib/reports";
import type { ReportInputs } from "@/lib/dataset/types";
import { cn } from "@/lib/utils";

const statements: Record<ReportTab, (r: ReportInputs) => StatementRow[]> = {
  "Profit & Loss": profitAndLossRows,
  "Cash Flow": cashFlowRows,
  "Balance Sheet": balanceSheetRows,
};

export default function ReportsPage() {
  const { fmt, signed } = useMoney();
  const [tab, setTab] = useState<ReportTab>("Profit & Loss");
  const { reports, source } = useDataset();
  const totals = periodTotals(reports);
  const rows = statements[tab](reports);
  const summary = aiSummary(reports);

  return (
    <AppShell title="Reports" subtitle="Analyze your financial performance">
      <section aria-label="Report summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue" value={fmt(totals.revenue, { compact: true })} icon={ArrowUpRight} tone="green" />
        <KpiCard label="Expenses" value={fmt(totals.expenses, { compact: true })} icon={ArrowDownRight} tone="red" />
        <KpiCard label="Net Profit" value={fmt(totals.netProfit, { compact: true })} icon={PiggyBank} tone="blue" />
        <KpiCard label="Profit Margin" value={formatPct(totals.margin)} icon={Percent} tone="purple" />
      </section>

      <Card className="mt-6">
        <CardHeader>
          <p className="text-[15px] font-semibold text-foreground">Revenue vs Expenses</p>
          <p className="text-[13px] text-muted-foreground">Monthly comparison</p>
        </CardHeader>
        <CardContent>
          <RevenueExpensesChart />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="gap-3">
          <p className="text-[15px] font-semibold text-foreground">Reports</p>
          <FilterChips label="Report type" options={reportTabs} value={tab} onChange={setTab} />
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <table className="w-full text-sm">
            <caption className="sr-only">{tab}</caption>
            <tbody>
              {rows.map((r, i) =>
                r.kind === "section" ? (
                  <tr key={i} className="border-t bg-muted/60">
                    <th colSpan={2} scope="colgroup" className="px-5 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {r.label}
                    </th>
                  </tr>
                ) : (
                  <tr key={i} className={cn("border-t", r.kind === "total" && "bg-muted/60 font-semibold", r.kind === "subtotal" && "font-medium")}>
                    <th scope="row" className={cn("px-5 py-2.5 text-left font-[inherit]", r.kind === "line" && "pl-8 font-normal text-muted-foreground")}>
                      {r.label}
                    </th>
                    <td className={cn("px-5 py-2.5 text-right tabular-nums", (r.amount ?? 0) < 0 && "text-negative")}>
                      {signed(r.amount ?? 0)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          <p className="px-5 pt-3 text-xs text-muted-foreground">
            {reports.note ?? "Illustrative statements built from Phase 1 mock data — real financial reports come later."}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Sparkles className="size-4 text-accent" aria-hidden />
          <p className="text-[15px] font-semibold text-foreground">AI Financial Summary</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-[14px] leading-relaxed">
            {summary.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">{source === "csv" ? "Summary generated from your uploaded data" : "Mock summary generated from Phase 1 data"} — no LLM connected yet.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
