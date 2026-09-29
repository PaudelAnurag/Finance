"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  FileText,
  LayoutGrid,
  LineChart,
  Receipt,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Ask Finance AI", href: "/ask-finance", icon: Sparkles },
  // { label: "Cash Flow", href: "/cash-flow", icon: LineChart },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  // { label: "Reports", href: "/reports", icon: FileText },
  { label: "Upload Data", href: "/upload-data", icon: Cloud },
  // { label: "Team & Users", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 shrink-0 flex-col overflow-y-auto bg-sidebar px-3 py-5 md:flex">
      <div className="flex items-center gap-2.5 px-3 pb-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
          <LineChart className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-white">Finance AI Agent</p>
          <p className="truncate text-xs text-sidebar-foreground">{settings.companyName}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Primary">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive = href === pathname;
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "bg-sidebar-active font-medium text-white hover:bg-sidebar-active",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-sidebar-border px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-sidebar-foreground">
          <Receipt className="size-4" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs font-medium text-white">{settings.companyName}</p>
          <p className="truncate text-[11px] text-sidebar-foreground">SME · {settings.industry}</p>
        </div>
      </div>
    </aside>
  );
}
