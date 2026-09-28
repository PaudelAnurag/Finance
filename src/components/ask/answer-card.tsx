import { ArrowUpRight, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

import { RevenueDonut } from "@/components/ask/revenue-donut";
import { RevenueTrendChart } from "@/components/ask/revenue-trend-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { revenueBySource } from "@/lib/demo/placeholder";

const toneDot: Record<string, string> = {
  blue: "bg-[var(--badge-blue-fg)]",
  purple: "bg-[var(--badge-purple-fg)]",
  green: "bg-[var(--badge-green-fg)]",
  orange: "bg-[var(--badge-orange-fg)]",
};

export function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-[14px] text-white">
        {text}
      </div>
      <p className="text-[11px] text-muted-foreground">{time}</p>
    </div>
  );
}

export function RevenueAnswerCard({ time }: { time: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <Card className="p-5">
          <p className="text-[14px] leading-relaxed">
            Your total revenue for last month (April 2025) was <span className="font-semibold">NPR 1.24 million</span>,
            which is <span className="font-semibold text-positive">6.2% higher</span> than March 2025 (NPR 1.17 million).
          </p>
          <p className="mt-2 text-[14px] text-muted-foreground">Here&apos;s a breakdown of revenue:</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-semibold tracking-tight">NPR 1.24m</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-positive">
                <ArrowUpRight className="size-3.5" /> +6.2% vs last month
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="px-1 text-xs text-muted-foreground">Revenue Trend</p>
              <RevenueTrendChart />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <p className="text-xs font-medium text-muted-foreground sm:hidden">Revenue by Source</p>
            <RevenueDonut />
            <div className="flex-1 space-y-2">
              <p className="hidden text-xs font-medium text-muted-foreground sm:block">Revenue by Source</p>
              {revenueBySource.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-[13px]">
                  <span className={`size-2 shrink-0 rounded-full ${toneDot[s.tone]}`} />
                  <span className="flex-1 text-muted-foreground">{s.label}</span>
                  <span className="w-10 text-right tabular-nums">{s.pct}%</span>
                  <span className="w-20 text-right tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-lg bg-muted p-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-[13px] text-muted-foreground">
              Would you like to see a detailed breakdown by customer, product, or compare with previous months?
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">View details</Button>
              <Button size="sm" variant="accent">Ask follow-up</Button>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">Sources: Financial data (April 2025)</p>
          <div className="flex items-center gap-3">
            <button aria-label="Helpful" className="text-muted-foreground hover:text-foreground">
              <ThumbsUp className="size-3.5" />
            </button>
            <button aria-label="Not helpful" className="text-muted-foreground hover:text-foreground">
              <ThumbsDown className="size-3.5" />
            </button>
            <p className="text-[11px] text-muted-foreground">{time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
