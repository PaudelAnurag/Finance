import { BarChart3 } from "lucide-react";

/** Shown instead of a chart/graph when there is nothing to plot yet. */
export function EmptyChart({ message, height = 220 }: { message: string; height?: number }) {
  return (
    <div style={{ height }} className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
      <BarChart3 className="size-6 text-muted-foreground" aria-hidden />
      <p className="max-w-xs text-[13px] text-muted-foreground">{message}</p>
    </div>
  );
}
