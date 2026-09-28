"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { useMoney } from "@/lib/currency";

export function RevenueTrendChart({ data }: { data: { month: string; value: number }[] }) {
  const { fmt } = useMoney();
  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <Tooltip
            formatter={(v) => fmt(v as number, { compact: true })}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--accent)" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
