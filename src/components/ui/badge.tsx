import { cn } from "@/lib/utils";

const tones = {
  green: "bg-[var(--badge-green-bg)] text-[var(--badge-green-fg)]",
  red: "bg-[var(--badge-red-bg)] text-[var(--badge-red-fg)]",
  orange: "bg-[var(--badge-orange-bg)] text-[var(--badge-orange-fg)]",
  blue: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-fg)]",
  purple: "bg-[var(--badge-purple-bg)] text-[var(--badge-purple-fg)]",
  gray: "bg-muted text-muted-foreground",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}
