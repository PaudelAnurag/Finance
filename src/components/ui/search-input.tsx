import { Search } from "lucide-react";

import { controlClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function SearchInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input type="search" className={cn(controlClass, "pl-9")} {...props} />
    </div>
  );
}
