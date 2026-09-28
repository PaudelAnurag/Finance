import { IconBadge } from "@/components/shell/icon-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  tone: React.ComponentProps<typeof IconBadge>["tone"];
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <IconBadge icon={icon} tone={tone} />
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", valueClassName)}>{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
