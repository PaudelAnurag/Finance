"use client";

import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DateRangePicker } from "@/components/shell/date-range-picker";
import { currencyOptions, useCurrency } from "@/lib/currency";

export function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b bg-background/95 px-6 py-5 backdrop-blur md:px-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <DateRangePicker />
        <button
          className="relative flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="size-4 text-muted-foreground" />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-risk-high text-[10px] font-medium text-white">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border bg-card py-1.5 pl-1.5 pr-2.5 hover:bg-muted"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-white">
              AP
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {open && (
            <>
              <button
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border bg-card p-2 shadow-lg">
                <p className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
                  Display currency
                </p>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    setOpen(false);
                  }}
                  className="w-full rounded-md border bg-card px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  size={8}
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 border-t pt-2">
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    Sign out
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
