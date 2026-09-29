import { ArrowDownRight, ArrowUpRight, ChevronRight, TrendingUp } from "lucide-react";

import { IconBadge } from "@/components/shell/icon-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentQuestions } from "@/data/mock-finance";
import { useMoney } from "@/lib/currency";
import { useDataset } from "@/lib/dataset/context";

const toneIcon = {
  green: ArrowUpRight,
  red: ArrowDownRight,
  blue: TrendingUp,
  orange: ArrowDownRight,
  purple: TrendingUp,
  teal: TrendingUp,
} as const;

export function QuickInsights({ onAsk }: { onAsk: (question: string) => void }) {
  const { text } = useMoney();
  const { quickInsights } = useDataset();
  return (
    <div className="flex w-full max-w-xs shrink-0 flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-[15px] font-semibold">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {quickInsights.map((i) => (
            <button
              key={i.title}
              onClick={() => onAsk(i.question)}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconBadge icon={toneIcon[i.tone]} tone={i.tone} />
              <span className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{i.title}</p>
                <p className="text-xs leading-snug text-muted-foreground">{text(i.detail)}</p>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-foreground text-[15px] font-semibold">Recent Questions</CardTitle>
          <button className="text-xs font-medium text-accent hover:underline">View all</button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recentQuestions.map((q) => (
            <button key={q.text} onClick={() => onAsk(q.text)} className="text-left transition-colors hover:text-accent">
              <p className="text-[13px] leading-snug">{q.text}</p>
              <p className="text-[11px] text-muted-foreground">{q.time}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-primary text-primary-foreground">
        <CardContent className="flex flex-col gap-3 pt-5">
          <p className="text-sm font-semibold">Need deeper analysis?</p>
          <p className="text-[13px] text-white/70">
            Ask complex questions, get strategic insights, and let Finance AI help you make better decisions.
          </p>
          <button className="flex items-center gap-1 text-[13px] font-medium text-white hover:underline">
            Explore advanced features →
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

