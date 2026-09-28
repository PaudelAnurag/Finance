import { CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CsvAnalysis } from "@/lib/csv/analyze";
import { useMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-1.5 text-sm", strong && "font-semibold")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function AccuracyCheck({ a }: { a: CsvAnalysis }) {
  const { fmt, signed } = useMoney();
  const s = a.summary;
  const failed = a.checks.filter((c) => !c.passed);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-foreground">Accuracy Check</h3>
        <p className="text-[13px] text-muted-foreground">CSV → calculation → result, verified independently</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y">
          <div className="pb-2">
            <Row label="CSV rows (below header)" value={String(a.totalDataRows)} />
            <Row label="Successfully processed" value={String(a.validRows)} />
            <Row label="Invalid rows" value={String(a.invalidRows)} />
            <Row label="Empty rows skipped" value={String(a.blankRows)} />
          </div>
          <div className="py-2">
            <Row label="Income transactions" value={String(s.incomeCount)} />
            <Row label="Expense transactions" value={String(s.expenseCount)} />
          </div>
          <div className="pt-2">
            <Row label="Total Income" value={fmt(s.incomeMinor / 100)} strong />
            <Row label="Total Expenses" value={fmt(s.expenseMinor / 100)} strong />
            <Row label="Net Cash Flow" value={signed(s.netMinor / 100, { showPlus: true })} strong />
          </div>
        </div>

        <ul className="space-y-1.5" aria-label="Reconciliation checks">
          {a.checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2 text-[13px]">
              {c.passed ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-negative" aria-hidden />
              )}
              <span>
                {c.label}
                {c.detail && <span className="text-muted-foreground"> — {c.detail}</span>}
              </span>
            </li>
          ))}
        </ul>

        <p role="status" className={cn("text-sm font-medium", failed.length ? "text-negative" : "text-positive")}>
          {failed.length
            ? `✕ ${failed.length} check${failed.length === 1 ? "" : "s"} failed — do not rely on these figures.`
            : "✓ All calculations completed successfully"}
        </p>
        <p className="text-xs text-muted-foreground">
          Amounts are shown in the selected display currency; the CSV has no currency column and no conversion is applied.
        </p>
      </CardContent>
    </Card>
  );
}
