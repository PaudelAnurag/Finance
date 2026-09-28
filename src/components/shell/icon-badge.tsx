import { cn } from "@/lib/utils";

const tones = {
  blue: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-fg)]",
  green: "bg-[var(--badge-green-bg)] text-[var(--badge-green-fg)]",
  red: "bg-[var(--badge-red-bg)] text-[var(--badge-red-fg)]",
  purple: "bg-[var(--badge-purple-bg)] text-[var(--badge-purple-fg)]",
  orange: "bg-[var(--badge-orange-bg)] text-[var(--badge-orange-fg)]",
  teal: "bg-[var(--badge-teal-bg)] text-[var(--badge-teal-fg)]",
};

export function IconBadge({
  icon: Icon,
  tone,
  className,
}: {
  icon: React.ElementType;
  tone: keyof typeof tones;
  className?: string;
}) {
  return (
    <span className={cn("flex size-9 items-center justify-center rounded-full", tones[tone], className)}>
      <Icon className="size-4.5" />
    </span>
  );
}
