// Deterministic calculations over a cash series (from the active dataset).
import type { CashPoint } from "@/lib/dataset/types";

type Actual = CashPoint & { actual: number };
type Forecast = CashPoint & { forecast: number };

export function actualRows(series: CashPoint[]) {
  return series.filter((r): r is Actual => r.actual != null);
}

export function forecastRows(series: CashPoint[]) {
  return series.filter((r): r is Forecast => r.forecast != null);
}

export function latestActual(series: CashPoint[]) {
  const rows = actualRows(series);
  return rows[rows.length - 1] ?? null;
}

export function periodStart(series: CashPoint[]) {
  return actualRows(series)[0] ?? null;
}

export function netChange(series: CashPoint[]) {
  const rows = actualRows(series);
  return rows.length ? rows[rows.length - 1].actual - rows[0].actual : 0;
}

export function projectedRunoutMonth(series: CashPoint[]): string | null {
  return forecastRows(series).find((r) => r.forecast <= 0)?.month ?? null;
}

export function monthOverMonthDeltas(series: CashPoint[]) {
  const rows = actualRows(series);
  return rows.slice(1).map((row, i) => ({
    month: row.month,
    value: row.actual,
    change: row.actual - rows[i].actual,
    changePct: rows[i].actual === 0 ? null : ((row.actual - rows[i].actual) / Math.abs(rows[i].actual)) * 100,
  }));
}

export function worstMonthDrop(series: CashPoint[]) {
  const rows = monthOverMonthDeltas(series);
  if (!rows.length) return null;
  const worst = [...rows].sort((a, b) => a.change - b.change)[0];
  return { month: worst.month, change: worst.change, changePct: worst.changePct };
}
