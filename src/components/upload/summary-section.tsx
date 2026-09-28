import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CategoryTotal, CsvAnalysis } from "@/lib/csv/analyze";
import { useMoney } from "@/lib/currency";

function Breakdown({ title, items, total }: { title: string; items: CategoryTotal[]; total: number }) {
  const { fmt } = useMoney();
  const max = items[0]?.totalMinor ?? 1;
  return (
    <Card>
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">None in this file.</p>}
        {items.map((c) => (
          <div key={c.category} className="space-y-1">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium">
                {c.category} <span className="font-normal text-muted-foreground">· {c.count}</span>
              </span>
              <span className="tabular-nums">
                {fmt(c.totalMinor / 100)}{" "}
                <span className="text-muted-foreground">({total ? ((c.totalMinor / total) * 100).toFixed(1) : "0.0"}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(c.totalMinor / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SummarySection({ a }: { a: CsvAnalysis }) {
  const { fmt, signed } = useMoney();
  const s = a.summary;
  return (
    <>
      <section aria-label="Financial summary" className="space-y-3">
        <h2 className="text-[15px] font-semibold">Financial Summary</h2>
        {a.invalidRows > 0 && (
          <p role="status" className="rounded-lg border border-risk-medium/40 bg-(--badge-orange-bg) px-3 py-2 text-[13px]">
            Calculated from {a.validRows} valid row{a.validRows === 1 ? "" : "s"}. {a.invalidRows} invalid row
            {a.invalidRows === 1 ? " was" : "s were"} excluded — fix them and re-upload for complete figures.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Total Income" value={fmt(s.incomeMinor / 100, { compact: true })} icon={ArrowUpRight} tone="green" />
          <KpiCard label="Total Expenses" value={fmt(s.expenseMinor / 100, { compact: true })} icon={ArrowDownRight} tone="red" />
          <KpiCard
            label="Net Cash Flow"
            value={signed(s.netMinor / 100, { compact: true, showPlus: true })}
            icon={Wallet}
            tone="blue"
            valueClassName={s.netMinor < 0 ? "text-negative" : "text-positive"}
          />
        </div>
        <p className="text-[13px] text-muted-foreground">
          Transactions: {a.validRows}
          {(s.pendingIncomeMinor > 0 || s.pendingExpenseMinor > 0) && (
            <>
              {" "}
              · includes pending: {fmt(s.pendingIncomeMinor / 100)} income, {fmt(s.pendingExpenseMinor / 100)} expenses
            </>
          )}
        </p>
      </section>

      <section aria-label="Category analysis" className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Expense Breakdown" items={s.categories.filter((c) => c.type === "Expense")} total={s.expenseMinor} />
        <Breakdown title="Income by Category" items={s.categories.filter((c) => c.type === "Income")} total={s.incomeMinor} />
      </section>
    </>
  );
}
