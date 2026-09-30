"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyChart } from "@/components/shell/empty-chart";
import { useDataset } from "@/lib/dataset/context";
import { useMoney } from "@/lib/currency";

export function CashChart({ height = 256 }: { height?: number }) {
  const { fmt, currency } = useMoney();
  const { cashSeries } = useDataset();
  const showDots = cashSeries.length <= 6;

  if (cashSeries.length === 0) {
    return <EmptyChart message="No cash flow yet — upload a CSV or connect an API on the Upload Data page." height={height} />;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={cashSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => fmt(v, { compact: true }).replace(`${currency} `, "")}
          />
          <Tooltip
            formatter={(v) => fmt(v as number, { compact: true })}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--primary)" strokeWidth={2} dot={showDots} connectNulls={false} />
          <Line type="monotone" dataKey="forecast" name="Forecast" stroke="var(--accent)" strokeWidth={2} strokeDasharray="5 4" dot={showDots} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
