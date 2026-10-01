"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { formatSpan } from "@/lib/date-range/dates";
import { useDateRangeControls, useFinancialDateRange } from "@/lib/date-range/context";
import { cn } from "@/lib/utils";

/**
 * The only control that changes the reporting period. It writes to the global date-range state;
 * it holds no period of its own (just the draft dates while the Custom Range form is open).
 */
export function DateRangePicker() {
  const range = useFinancialDateRange();
  const { choices, active, selectPreset, applyCustomRange } = useDateRangeControls();
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setOpen((v) => !v);
    setCustomOpen(false);
    setError(null);
  }

  function openCustom() {
    setStart(range.startIso);
    setEnd(range.endIso);
    setError(null);
    setCustomOpen(true);
  }

  function apply() {
    const problem = applyCustomRange(start, end);
    if (problem) return setError(problem);
    setOpen(false);
    setCustomOpen(false);
  }

  return (
    <div className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        title={formatSpan(range.startIso, range.endIso)}
        className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted"
      >
        <Calendar className="size-4" />
        <span className="max-w-[10rem] truncate sm:max-w-none">{range.label}</span>
        <ChevronDown className="size-3.5" />
      </button>

      {open && (
        <>
          <button aria-label="Close date range menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 z-20 mt-2 w-72 rounded-lg border bg-card p-2 shadow-lg">
            <p className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">Reporting period</p>
            {choices.map((c) => (
              <button
                key={c.id}
                role="menuitemradio"
                aria-checked={active === c.id}
                onClick={() => {
                  if (c.id === "custom") return openCustom();
                  selectPreset(c.id);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                  active === c.id && "bg-muted font-medium",
                )}
              >
                {c.label}
                {c.span && <span className="block text-xs font-normal text-muted-foreground">{c.span}</span>}
              </button>
            ))}

            {customOpen && (
              <div className="mt-2 space-y-3 border-t px-2 pb-2 pt-3">
                <label className="block space-y-1">
                  <span className="text-[13px] font-medium">Start Date</span>
                  <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                </label>
                <label className="block space-y-1">
                  <span className="text-[13px] font-medium">End Date</span>
                  <Input type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
                </label>
                {error && (
                  <p role="alert" className="text-xs text-negative">
                    {error}
                  </p>
                )}
                <Button variant="accent" size="sm" className="w-full" onClick={apply}>
                  Apply
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
