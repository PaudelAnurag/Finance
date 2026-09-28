"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Summary } from "@/lib/csv/analyze";
import { useMoney } from "@/lib/currency";
import { formatMonth } from "@/lib/transactions";

const axis = { fontSize: 12, fill: "var(--muted-foreground)" };
const tooltipStyle = { borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 };

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

export function UploadCharts({ summary }: { summary: Summary }) {
  const { fmt, currency } = useMoney();
  const tick = (v: number) => fmt(v, { compact: true }).replace(`${currency} `, "");

  const monthly = summary.monthly.map((m) => ({
    label: formatMonth(m.month),
    income: m.incomeMinor / 100,
    expenses: m.expenseMinor / 100,
    cumulative: m.cumulativeMinor / 100,
  }));
  const expenseCats = summary.categories
    .filter((c) => c.type === "Expense")
    .map((c) => ({ name: c.category, total: c.totalMinor / 100 }));

  return (
    <section aria-label="Charts" className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Income vs Expenses" subtitle="By month, from your CSV">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} />
            <YAxis tickLine={false} axisLine={false} tick={axis} tickFormatter={tick} />
            <Tooltip cursor={{ fill: "var(--muted)" }} formatter={(v) => fmt(v as number)} contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" name="Income" fill="var(--positive)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--negative)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Expenses by Category" subtitle="Largest first">
        {expenseCats.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No expense transactions.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseCats} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tick={axis} tickFormatter={tick} />
              <YAxis type="category" dataKey="name" width={90} tickLine={false} axisLine={false} tick={axis} />
              <Tooltip cursor={{ fill: "var(--muted)" }} formatter={(v) => fmt(v as number)} contentStyle={tooltipStyle} />
              <Bar dataKey="total" name="Expenses" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="lg:col-span-2">
        <ChartCard title="Cash Flow Over Time" subtitle="Cumulative net cash flow by month">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickLine={false} axisLine={false} tick={axis} tickFormatter={tick} />
              <Tooltip formatter={(v) => fmt(v as number)} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="cumulative" name="Cumulative net" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
