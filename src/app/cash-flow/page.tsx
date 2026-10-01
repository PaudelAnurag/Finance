"use client";

import { ArrowDownRight, ArrowUpRight, CalendarClock, TrendingDown, Wallet } from "lucide-react";

import { CashChart } from "@/components/overview/cash-chart";
import { AppShell } from "@/components/shell/app-shell";
import { IconBadge } from "@/components/shell/icon-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMoney } from "@/lib/currency";
import { useDataset } from "@/lib/dataset/context";
import {
  latestActual,
  monthOverMonthDeltas,
  netChange,
  periodStart,
  projectedRunoutMonth,
} from "@/lib/cash-flow";
import { formatPct } from "@/lib/format";
import { pctChange } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function CashFlowPage() {
  const { fmt } = useMoney();
  const { cashSeries, cashNote } = useDataset();
  const latest = latestActual(cashSeries);
  const start = periodStart(cashSeries);
  const change = netChange(cashSeries);
  const pct = start && latest ? pctChange(start.actual, latest.actual) : null;
  const runout = projectedRunoutMonth(cashSeries);
  const rows = monthOverMonthDeltas(cashSeries);

  if (!latest || !start) {
    return (
      <AppShell title="Cash Flow" subtitle="No cash data available">
        <p className="text-sm text-muted-foreground">Upload a CSV with transactions to see cash flow.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Cash Flow" subtitle={`Actuals through ${latest.month}, forecast beyond`}>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <IconBadge icon={Wallet} tone="blue" />
            <p className="text-sm text-muted-foreground">Cash on hand</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{fmt(latest.actual, { compact: true })}</p>
            <p className="text-xs text-muted-foreground">as of {latest.month}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <IconBadge icon={change < 0 ? ArrowDownRight : ArrowUpRight} tone={change < 0 ? "red" : "green"} />
            <p className="text-sm text-muted-foreground">Change since {start.month}</p>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", change < 0 ? "text-negative" : "text-positive")}>
              {fmt(change, { compact: true })}
            </p>
            <p className="text-xs text-muted-foreground">{pct === null ? "n/a" : formatPct(pct)} over period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <IconBadge icon={runout ? TrendingDown : CalendarClock} tone={runout ? "red" : "purple"} />
            <p className="text-sm text-muted-foreground">Forecast runout</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{runout ?? "Not projected"}</p>
            <p className="text-xs text-muted-foreground">{runout ? "cash reaches zero at this rate" : "within forecast window"}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <p className="text-[15px] font-semibold">Cash Position</p>
            <p className="text-[13px] text-muted-foreground">Actual (solid) vs forecast (dashed)</p>
          </CardHeader>
          <CardContent>
            <CashChart height={320} />
            {cashNote && <p className="mt-2 text-xs text-muted-foreground">{cashNote}</p>}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <p className="text-[15px] font-semibold">Month-over-month</p>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2 font-medium">Month</th>
                  <th className="px-5 py-2 font-medium">Cash</th>
                  <th className="px-5 py-2 font-medium">Change</th>
                  <th className="px-5 py-2 font-medium">% change</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.month} className="border-t">
                    <td className="px-5 py-2.5">{r.month}</td>
                    <td className="px-5 py-2.5 tabular-nums">{fmt(r.value, { compact: true })}</td>
                    <td className={cn("px-5 py-2.5 tabular-nums", r.change < 0 ? "text-negative" : "text-positive")}>
                      {fmt(r.change, { compact: true })}
                    </td>
                    <td className={cn("px-5 py-2.5 tabular-nums", (r.changePct ?? 0) < 0 ? "text-negative" : "text-positive")}>
                      {r.changePct === null ? "n/a" : formatPct(r.changePct, { signed: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
