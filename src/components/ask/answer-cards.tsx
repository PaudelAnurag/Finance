"use client";

import { AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { RevenueDonut, toneHex } from "@/components/ask/revenue-donut";
import { RevenueTrendChart } from "@/components/ask/revenue-trend-chart";
import { CashChart } from "@/components/overview/cash-chart";
import { Button } from "@/components/ui/button";
import { biggestExpense, expenseDeltaTotal, expenseTotal } from "@/lib/ask-finance";
import { latestActual, projectedRunoutMonth } from "@/lib/cash-flow";
import { useMoney } from "@/lib/currency";
import { useDataset } from "@/lib/dataset/context";
import { cn } from "@/lib/utils";

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export function RevenueAnswer() {
  const { fmt } = useMoney();
  const { ask } = useDataset();
  const r = ask.revenue;
  const up = (r.deltaPct ?? 0) >= 0;

  return (
    <>
      <p className="text-[14px] leading-relaxed">
        Your total revenue for {r.periodLabel} was <span className="font-semibold">{fmt(r.total, { compact: true })}</span>
        {r.deltaPct !== null && r.previous !== null ? (
          <>
            , which is{" "}
            <span className={cn("font-semibold", up ? "text-positive" : "text-negative")}>
              {Math.abs(r.deltaPct).toFixed(1)}% {up ? "higher" : "lower"}
            </span>{" "}
            than the prior month ({fmt(r.previous, { compact: true })}).
          </>
        ) : (
          <>. There is no earlier month in the data to compare against.</>
        )}
      </p>
      <p className="mt-2 text-[14px] text-muted-foreground">Here&apos;s a breakdown of revenue:</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col justify-center rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-semibold tracking-tight">{fmt(r.total, { compact: true })}</p>
          {r.deltaPct !== null && (
            <p className={cn("mt-0.5 flex items-center gap-1 text-xs", up ? "text-positive" : "text-negative")}>
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />} {pct(r.deltaPct)} vs last month
            </p>
          )}
        </div>
        <div className="rounded-lg border p-3">
          <p className="px-1 text-xs text-muted-foreground">Revenue Trend</p>
          <RevenueTrendChart data={r.trend} />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
        {r.bySource.length > 0 ? (
          <>
            <RevenueDonut items={r.bySource} total={r.total} />
            <div className="w-full max-w-md flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Revenue by Source</p>
              {r.bySource.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-[13px]">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: toneHex[s.tone] }} />
                  <span className="flex-1 text-muted-foreground">{s.label}</span>
                  <span className="w-12 text-right tabular-nums">{r.total ? ((s.value / r.total) * 100).toFixed(0) : 0}%</span>
                  <span className="w-24 text-right tabular-nums">{fmt(s.value, { compact: true })}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-[13px] text-muted-foreground">No income transactions in {r.periodLabel}.</p>
        )}
      </div>

      <FollowUpBar prompt="Would you like a breakdown by customer, product, or a comparison with prior months?" />
    </>
  );
}

export function CashDecreaseAnswer() {
  const { fmt, signed } = useMoney();
  const { ask } = useDataset();
  const c = ask.cash;
  const decreased = c.deltaPct !== null ? c.deltaPct < 0 : c.change < 0;

  return (
    <>
      <p className="text-[14px] leading-relaxed">
        {decreased ? (
          <>
            Cash is down{" "}
            <span className="font-semibold text-negative">
              {c.deltaPct !== null ? `${Math.abs(c.deltaPct).toFixed(1)}%` : fmt(Math.abs(c.change), { compact: true })}
            </span>
            , now at <span className="font-semibold">{fmt(c.latest, { compact: true })}</span>.
          </>
        ) : (
          <>
            Cash has <span className="font-semibold text-positive">not decreased</span>
            {c.deltaPct !== null ? <> — it is up {c.deltaPct.toFixed(1)}%</> : null}, now at{" "}
            <span className="font-semibold">{fmt(c.latest, { compact: true })}</span>.
          </>
        )}{" "}
        {c.worstMonth && c.worstMonth.change < 0 ? (
          <>
            The steepest single-month drop was <span className="font-semibold">{c.worstMonth.month}</span>, down{" "}
            {signed(c.worstMonth.change, { compact: true })}
            {c.worstMonth.changePct !== null ? ` (${c.worstMonth.changePct.toFixed(1)}%)` : ""}.
          </>
        ) : (
          <>No month-over-month drop was found in the data.</>
        )}
      </p>
      <div className="mt-4 rounded-lg border p-3">
        <p className="px-1 text-xs text-muted-foreground">Cash trend</p>
        <CashChart height={180} />
      </div>
      {c.receivables > 0 && (
        <div className="mt-3 rounded-lg border p-4 text-[13px]">
          <p className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="size-3.5 text-risk-medium" />
            Receivables of {fmt(c.receivables, { compact: true })} not yet collected are a likely contributor — see the pending
            income list for detail.
          </p>
        </div>
      )}
      <FollowUpBar prompt="Want a breakdown of what's driving payables, or a forecast of when cash stabilizes?" />
    </>
  );
}

export function OverdueAnswer() {
  const { fmt } = useMoney();
  const { ask } = useDataset();
  const p = ask.pending;

  return (
    <>
      {p.mode === "overdue" ? (
        <p className="text-[14px] leading-relaxed">
          <span className="font-semibold">{p.items.length} customers</span> have overdue invoices totalling{" "}
          <span className="font-semibold text-negative">{fmt(p.total, { compact: true })}</span>.
        </p>
      ) : p.items.length > 0 ? (
        <p className="text-[14px] leading-relaxed">
          Your data has no due dates, so I can&apos;t tell what is overdue. These income transactions are still{" "}
          <span className="font-semibold">Pending</span>, totalling{" "}
          <span className="font-semibold text-negative">{fmt(p.total, { compact: true })}</span>.
        </p>
      ) : (
        <p className="text-[14px] leading-relaxed">
          There are no pending income transactions in your data. (It has no due dates, so overdue status can&apos;t be determined.)
        </p>
      )}
      {p.items.length > 0 && (
        <div className="mt-4 divide-y rounded-lg border">
          {p.items.map((i, n) => (
            <div key={`${i.name}-${n}`} className="flex items-center justify-between px-4 py-3 text-[13px]">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-muted-foreground">{i.detail}</p>
              </div>
              <p className="tabular-nums font-medium text-negative">{fmt(i.amount, { compact: true })}</p>
            </div>
          ))}
        </div>
      )}
      <FollowUpBar prompt="Want me to draft payment reminder emails for these customers?" />
    </>
  );
}

export function CashflowAnswer() {
  const { fmt } = useMoney();
  const { cashSeries } = useDataset();
  const latest = latestActual(cashSeries);
  const runout = projectedRunoutMonth(cashSeries);

  return (
    <>
      {latest ? (
        <p className="text-[14px] leading-relaxed">
          Cash stands at <span className="font-semibold">{fmt(latest.actual, { compact: true })}</span> as of {latest.month}.{" "}
          {runout ? (
            <>
              At the current forecast rate, cash reaches zero around <span className="font-semibold text-negative">{runout}</span>.
            </>
          ) : (
            <>The forecast stays positive through the current window.</>
          )}
        </p>
      ) : (
        <p className="text-[14px]">No cash data available yet — upload a CSV or connect an API.</p>
      )}
      <div className="mt-4 rounded-lg border p-3">
        <CashChart height={220} />
      </div>
      <FollowUpBar prompt="Want to model a scenario — delayed hiring, or collecting pending income sooner?" />
    </>
  );
}

export function ExpensesAnswer() {
  const { fmt } = useMoney();
  const { ask } = useDataset();
  const e = ask.expenses;
  const sorted = [...e.items].sort((a, b) => b.amount - a.amount);
  const total = expenseTotal(e.items);
  const delta = expenseDeltaTotal(e.items);
  const biggest = biggestExpense(e.items);

  if (!biggest) {
    return <p className="text-[14px] leading-relaxed">There are no expense transactions in {e.periodLabel}.</p>;
  }

  return (
    <>
      <p className="text-[14px] leading-relaxed">
        Total tracked expenses for {e.periodLabel} are <span className="font-semibold">{fmt(total, { compact: true })}</span>
        {e.hasPrior && (
          <>
            , {delta >= 0 ? "up" : "down"}{" "}
            <span className={cn("font-semibold", delta >= 0 ? "text-negative" : "text-positive")}>
              {fmt(Math.abs(delta), { compact: true })}
            </span>{" "}
            vs the prior month
          </>
        )}
        . <span className="font-semibold">{biggest.category}</span> is the largest line item.
      </p>
      <div className="mt-4 space-y-2 rounded-lg border p-4">
        {sorted.map((x) => (
          <div key={x.category} className="flex items-center gap-3 text-[13px]">
            <span className="w-24 shrink-0 truncate text-muted-foreground">{x.category}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(x.amount / sorted[0].amount) * 100}%` }} />
            </div>
            <span className="w-20 shrink-0 text-right tabular-nums">{fmt(x.amount, { compact: true })}</span>
            {e.hasPrior && (
              <span
                className={cn(
                  "flex w-20 shrink-0 items-center justify-end gap-0.5 text-xs tabular-nums",
                  x.deltaFromPrior > 0 ? "text-negative" : x.deltaFromPrior < 0 ? "text-positive" : "text-muted-foreground",
                )}
              >
                {x.deltaFromPrior !== 0 && (x.deltaFromPrior > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />)}
                {fmt(Math.abs(x.deltaFromPrior), { compact: true })}
              </span>
            )}
          </div>
        ))}
      </div>
      <FollowUpBar prompt="Want to compare this against budget, or investigate the largest category?" />
    </>
  );
}

function FollowUpBar({ prompt }: { prompt: string }) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg bg-muted p-3 sm:flex-row sm:items-center">
      <p className="flex-1 text-[13px] text-muted-foreground">{prompt}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline">View details</Button>
        <Button size="sm" variant="accent">Ask follow-up</Button>
      </div>
    </div>
  );
}
