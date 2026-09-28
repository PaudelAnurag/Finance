"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import type { Tone } from "@/lib/dataset/types";
import { useMoney } from "@/lib/currency";

export const toneHex: Record<Tone, string> = {
  blue: "var(--badge-blue-fg)",
  purple: "var(--badge-purple-fg)",
  green: "var(--badge-green-fg)",
  orange: "var(--badge-orange-fg)",
  red: "var(--badge-red-fg)",
  teal: "var(--badge-teal-fg)",
};

export function RevenueDonut({ items, total }: { items: { label: string; value: number; tone: Tone }[]; total: number }) {
  const { fmt } = useMoney();
  return (
    <div className="relative size-32 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={items} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="100%" strokeWidth={2} stroke="var(--card)">
            {items.map((d) => (
              <Cell key={d.label} fill={toneHex[d.tone]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[13px] font-semibold leading-tight">{fmt(total, { compact: true })}</p>
        <p className="text-[10px] text-muted-foreground">Total Revenue</p>
      </div>
    </div>
  );
}
