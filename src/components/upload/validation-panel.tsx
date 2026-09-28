"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CsvAnalysis } from "@/lib/csv/analyze";
import { cn } from "@/lib/utils";

const ISSUE_PAGE = 50;

function Line({ tone, children }: { tone: "ok" | "warn" | "bad"; children: React.ReactNode }) {
  const Icon = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertTriangle : XCircle;
  return (
    <li className="flex items-start gap-2 text-sm">
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "ok" && "text-positive",
          tone === "warn" && "text-risk-medium",
          tone === "bad" && "text-negative",
        )}
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

export function ValidationPanel({ a }: { a: CsvAnalysis }) {
  const [showAll, setShowAll] = useState(false);
  const errors = a.issues.filter((i) => i.severity === "error");
  const warnings = a.issues.filter((i) => i.severity === "warning");
  const ordered = [...errors, ...warnings];
  const shown = showAll ? ordered : ordered.slice(0, ISSUE_PAGE);
  const detected = a.totalDataRows - a.blankRows;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-[15px] font-semibold text-foreground">CSV Validation</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2" aria-label="Validation results">
          {a.fatalError ? (
            <Line tone="bad">{a.fatalError}</Line>
          ) : (
            <>
              <Line tone="ok">File format is valid</Line>
              <Line tone="ok">Required columns found</Line>
              <Line tone="ok">
                {detected} transaction{detected === 1 ? "" : "s"} detected
              </Line>
              <Line tone={a.invalidRows === 0 ? "ok" : "warn"}>
                {a.validRows} valid row{a.validRows === 1 ? "" : "s"}
              </Line>
              {a.invalidRows > 0 && (
                <Line tone="bad">
                  {a.invalidRows} invalid row{a.invalidRows === 1 ? "" : "s"} (excluded from calculations)
                </Line>
              )}
            </>
          )}
        </ul>

        {!a.fatalError && (
          <p className="text-sm">
            <span className={cn("font-medium", errors.length ? "text-negative" : "text-positive")}>Errors: {errors.length}</span>
            <span className="mx-3 text-muted-foreground">·</span>
            <span className={cn("font-medium", warnings.length ? "text-risk-medium" : "text-positive")}>Warnings: {warnings.length}</span>
          </p>
        )}

        {ordered.length > 0 && (
          <div>
            <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-3 text-[13px]" aria-label="Issues by row">
              {shown.map((i, n) => (
                <li key={n} className="flex gap-2">
                  <span className={cn("w-16 shrink-0 font-medium tabular-nums", i.severity === "error" ? "text-negative" : "text-risk-medium")}>
                    {i.row === null ? "Header" : `Row ${i.row}`}
                  </span>
                  <span aria-hidden>→</span>
                  <span className="text-muted-foreground">{i.message}</span>
                </li>
              ))}
            </ul>
            {ordered.length > ISSUE_PAGE && (
              <button onClick={() => setShowAll((v) => !v)} className="mt-2 text-[13px] font-medium text-accent hover:underline">
                {showAll ? "Show fewer" : `Show all ${ordered.length} issues`}
              </button>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Row numbers match line numbers in your file (the header is row 1).</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
