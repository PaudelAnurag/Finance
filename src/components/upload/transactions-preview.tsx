"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import type { ParsedTransaction } from "@/lib/csv/analyze";
import { useMoney } from "@/lib/currency";
import { formatShortDate } from "@/lib/transactions";
import { cn } from "@/lib/utils";

const PAGE = 25;

export function TransactionsPreview({ rows }: { rows: ParsedTransaction[] }) {
  const { signed } = useMoney();
  const [limit, setLimit] = useState(PAGE);
  const shown = rows.slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <h3 className="text-[15px] font-semibold text-foreground">Imported Transactions</h3>
        <span className="text-[13px] text-muted-foreground">{rows.length} rows</span>
      </CardHeader>
      <div className="overflow-x-auto pt-3">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-t text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Row</th>
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-5 py-2.5 font-medium">Description</th>
              <th className="px-5 py-2.5 font-medium">Category</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t) => (
              <tr key={t.row} className="border-t hover:bg-muted/50">
                <td className="px-5 py-2.5 tabular-nums text-muted-foreground">{t.row}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{formatShortDate(t.date)}</td>
                <td className="px-5 py-2.5 font-medium">
                  {t.description}
                  {t.duplicateOf && (
                    <span className="ml-2 align-middle">
                      <Badge tone="orange">Possible duplicate</Badge>
                    </span>
                  )}
                </td>
                <td className="px-5 py-2.5 text-muted-foreground">{t.category}</td>
                <td className="px-5 py-2.5">
                  <Badge tone={t.type === "Income" ? "green" : "red"}>{t.type}</Badge>
                </td>
                <td className="px-5 py-2.5">
                  <Badge tone={t.status === "Pending" ? "orange" : "gray"}>{t.status}</Badge>
                </td>
                <td className={cn("px-5 py-2.5 text-right font-medium tabular-nums", t.type === "Income" ? "text-positive" : "text-negative")}>
                  {signed((t.type === "Income" ? t.amountMinor : -t.amountMinor) / 100, { showPlus: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <div className="border-t px-5 py-3">
          <button onClick={() => setLimit((l) => l + 100)} className="text-[13px] font-medium text-accent hover:underline">
            Show more ({Math.min(100, rows.length - limit)} of {rows.length - limit} remaining)
          </button>
        </div>
      )}
    </Card>
  );
}
