// Turns a preset ("This Month", "Last Fiscal Year", …) + the active fiscal year into a concrete
// reporting period. Pure functions, no React — the same code can run on a backend later.
import { addDays, formatSpan, isoFromParts, type IsoDate } from "@/lib/date-range/dates";
import { fiscalYearLabel, quarterStart, shiftFiscalYear, type FiscalYear } from "@/lib/date-range/fiscal-year";

export type PresetId = "this-month" | "last-month" | "this-quarter" | "this-fiscal-year" | "last-fiscal-year" | "custom";

export const presetOptions: { id: PresetId; label: string }[] = [
  { id: "this-month", label: "This Month" },
  { id: "last-month", label: "Last Month" },
  { id: "this-quarter", label: "This Quarter" },
  { id: "this-fiscal-year", label: "This Fiscal Year" },
  { id: "last-fiscal-year", label: "Last Fiscal Year" },
  { id: "custom", label: "Custom Range" },
];

export interface ResolvedPeriod {
  startIso: IsoDate;
  endIso: IsoDate;
  /** Short text for the selector button, e.g. "FY 2026/27" or "Jan 1, 2026 – Mar 31, 2026". */
  label: string;
}

const monthBounds = (year: number, month1: number) => ({
  start: isoFromParts(year, month1, 1),
  end: isoFromParts(year, month1, 31), // day is clamped to the month's last day
});

/** Fiscal quarter (3-month block counted from the fiscal-year start) that contains `today`. */
function fiscalQuarter(fy: FiscalYear, today: IsoDate): { index: number; start: IsoDate; end: IsoDate } {
  let found = 0;
  for (let i = 0; i < 4; i++) if (quarterStart(fy, i) <= today) found = i;
  const start = quarterStart(fy, found);
  const naturalEnd = addDays(quarterStart(fy, found + 1), -1);
  return { index: found, start, end: naturalEnd > fy.end ? fy.end : naturalEnd };
}

export function resolvePeriod(
  preset: PresetId,
  ctx: { today: IsoDate; fiscalYear: FiscalYear; custom?: { start: IsoDate; end: IsoDate } | null },
): ResolvedPeriod {
  const { today, fiscalYear } = ctx;
  const y = +today.slice(0, 4);
  const m = +today.slice(5, 7);

  switch (preset) {
    case "this-month": {
      const b = monthBounds(y, m);
      return { startIso: b.start, endIso: b.end, label: "This Month" };
    }
    case "last-month": {
      const b = m === 1 ? monthBounds(y - 1, 12) : monthBounds(y, m - 1);
      return { startIso: b.start, endIso: b.end, label: "Last Month" };
    }
    case "this-quarter": {
      const q = fiscalQuarter(fiscalYear, today);
      return { startIso: q.start, endIso: q.end, label: `Q${q.index + 1} · ${fiscalYearLabel(fiscalYear)}` };
    }
    case "last-fiscal-year": {
      const last = shiftFiscalYear(fiscalYear, -1);
      return { startIso: last.start, endIso: last.end, label: fiscalYearLabel(last) };
    }
    case "custom": {
      if (ctx.custom && ctx.custom.start <= ctx.custom.end) {
        return { startIso: ctx.custom.start, endIso: ctx.custom.end, label: formatSpan(ctx.custom.start, ctx.custom.end) };
      }
      // Custom chosen but no valid dates yet: behave like the fiscal year until the user applies one.
      return { startIso: fiscalYear.start, endIso: fiscalYear.end, label: fiscalYearLabel(fiscalYear) };
    }
    case "this-fiscal-year":
    default:
      return { startIso: fiscalYear.start, endIso: fiscalYear.end, label: fiscalYearLabel(fiscalYear) };
  }
}
