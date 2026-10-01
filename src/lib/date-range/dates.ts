// Calendar-date helpers. Dates travel as plain "yyyy-mm-dd" strings (the same shape
// transactions use), so comparisons are timezone-proof: string order === date order.
// All arithmetic runs in UTC so DST and the viewer's timezone can never shift a day.

export type IsoDate = string;

const pad = (n: number) => String(n).padStart(2, "0");

const daysInMonth = (year: number, month1: number) => new Date(Date.UTC(year, month1, 0)).getUTCDate();

/** Builds yyyy-mm-dd, clamping the day (Feb 30 → Feb 28/29). */
export function isoFromParts(year: number, month1: number, day: number): IsoDate {
  return `${year}-${pad(month1)}-${pad(Math.min(day, daysInMonth(year, month1)))}`;
}

export function isValidIso(value: unknown): value is IsoDate {
  if (typeof value !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  return y >= 1900 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

const parts = (iso: IsoDate) => ({ y: +iso.slice(0, 4), m: +iso.slice(5, 7), d: +iso.slice(8, 10) });

/** The viewer's local calendar date. */
export function toIsoLocal(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A local-midnight Date for UI code that wants a Date object. */
export function isoToLocalDate(iso: IsoDate): Date {
  const { y, m, d } = parts(iso);
  return new Date(y, m - 1, d);
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const { y, m, d } = parts(iso);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Adds calendar months, clamping the day. Always call with the ORIGINAL date to avoid drift. */
export function addMonths(iso: IsoDate, months: number): IsoDate {
  const { y, m, d } = parts(iso);
  const total = y * 12 + (m - 1) + months;
  return isoFromParts(Math.floor(total / 12), (total % 12) + 1, d);
}

export const addYears = (iso: IsoDate, years: number) => addMonths(iso, years * 12);

const fmt = (iso: IsoDate, opts: Intl.DateTimeFormatOptions) => {
  const { y, m, d } = parts(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
};

/** "July 16, 2026" */
export const formatLong = (iso: IsoDate) => fmt(iso, { month: "long", day: "numeric", year: "numeric" });
/** "July 16" */
export const formatMonthDay = (iso: IsoDate) => fmt(iso, { month: "long", day: "numeric" });
/** "Jan 1, 2026" */
const formatShort = (iso: IsoDate) => fmt(iso, { month: "short", day: "numeric", year: "numeric" });
/** "Jan 1, 2026 – Mar 31, 2026" */
export const formatSpan = (start: IsoDate, end: IsoDate) => `${formatShort(start)} – ${formatShort(end)}`;
/** "Jan 5" */
export const formatShortDate = (iso: IsoDate) => fmt(iso, { month: "short", day: "numeric" });
/** "2026-01" → "Jan 2026" */
export const formatYearMonth = (ym: string) => fmt(`${ym}-01`, { month: "short", year: "numeric" });
/** "2026-01" + 3 → "2026-04" */
export const addMonthsToYearMonth = (ym: string, months: number) => addMonths(`${ym}-01`, months).slice(0, 7);
