import { Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDataset } from "@/lib/dataset/context";

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

export function AnswerFrame({
  time,
  source,
  children,
}: {
  time: string;
  source: string;
  children: React.ReactNode;
}) {
  const { period } = useDataset();
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <Card className="p-5">{children}</Card>
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">Sources: {source}{period ? ` · Period: ${period.label}` : ""}</p>
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
