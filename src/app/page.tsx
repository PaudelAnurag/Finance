"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  PenSquare,
  Percent,
  Receipt,
  Rocket,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { CashChart } from "@/components/overview/cash-chart";
import { AppShell } from "@/components/shell/app-shell";
import { IconBadge } from "@/components/shell/icon-badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useMoney } from "@/lib/currency";
import { useDataset } from "@/lib/dataset/context";
import type { SnapshotMetric } from "@/lib/dataset/types";
import { formatDelta, formatPct } from "@/lib/format";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const metricStyle = {
  revenue: { icon: ArrowUpRight, tone: "green" },
  cash: { icon: ArrowDownRight, tone: "red" },
  margin: { icon: Percent, tone: "purple" },
  runway: { icon: Rocket, tone: "blue" },
  receivables: { icon: Users, tone: "teal" },
  payables: { icon: Receipt, tone: "green" },
} as const;

const severityDot = {
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

export default function Home() {
  const { fmt, currency, text } = useMoney();
  const { settings } = useSettings();
  const data = useDataset();

  function display(m: SnapshotMetric) {
    if (m.kind === "money") return fmt(m.value as number, { compact: true });
    if (m.kind === "pct") return formatPct(m.value as number);
    if (m.kind === "months") return `${(m.value as number).toFixed(1)} mo`;
    return String(m.value);
  }

  return (
    <AppShell title={`Good morning, ${settings.companyName} Team`} subtitle={`Here's your financial overview for ${settings.companyName}`}>
      <section aria-label="Financial snapshot" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {data.snapshot.map((m) => {
          const style = metricStyle[m.key];
          const isUp = m.delta ? m.delta.value > 0 : false;
          return (
            <Card key={m.key}>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <IconBadge icon={style.icon} tone={style.tone} />
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{display(m)}</p>
                {m.delta && (
                  <p className={cn("mt-1 inline-flex items-center gap-1 text-xs tabular-nums", isUp ? "text-positive" : "text-negative")}>
                    {isUp ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    {formatDelta(m.delta, currency)} vs last month
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
      {data.snapshotNote && <p className="mt-3 text-xs text-muted-foreground">{data.snapshotNote}</p>}

      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <p className="text-[15px] font-semibold">Cash Flow Overview</p>
            <p className="text-[13px] text-muted-foreground">Actual (solid) and forecast (dashed)</p>
          </CardHeader>
          <CardContent>
            <CashChart />
            {data.cashNote && <p className="mt-2 text-xs text-muted-foreground">{data.cashNote}</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <span className="flex size-8 items-center justify-center rounded-full bg-(--badge-red-bg) text-(--badge-red-fg)">
              <Wallet className="size-4" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-foreground">Needs Your Attention</p>
              <p className="text-[13px] text-muted-foreground">{data.attention.length} items</p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {data.attention.length === 0 && (
              <p className="px-2 py-3 text-sm text-muted-foreground">Nothing needs your attention right now.</p>
            )}
            {data.attention.map((a) => (
              <button
                key={a.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={cn("size-2 shrink-0 rounded-full", severityDot[a.severity])} aria-hidden />
                <span className="flex-1">
                  <p>{text(a.text)}</p>
                  <p className="text-xs text-muted-foreground">{text(a.detail)}</p>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
          <CardFooter>
            <a
              href="#"
              className="flex w-full items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/70"
            >
              View all issues
            </a>
          </CardFooter>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
            <Sparkles className="size-5 text-accent" aria-hidden />
            <p className="flex-1 text-[15px] text-muted-foreground">Ask Finance AI — get instant answers about your finances…</p>
            <a
              href="/ask-finance"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <PenSquare className="size-4" /> Ask Finance
            </a>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
