"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyChart } from "@/components/shell/empty-chart";
import { useMoney } from "@/lib/currency";
import { useDataset } from "@/lib/dataset/context";

export function RevenueExpensesChart({ height = 300 }: { height?: number }) {
  const { fmt, currency } = useMoney();
  const { reports } = useDataset();

  if (reports.monthly.length === 0) {
    return <EmptyChart message="No revenue or expense data yet — upload a CSV or connect an API." height={height} />;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={reports.monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => fmt(v, { compact: true }).replace(`${currency} `, "")}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            formatter={(v) => fmt(v as number, { compact: true })}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" name="Revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
