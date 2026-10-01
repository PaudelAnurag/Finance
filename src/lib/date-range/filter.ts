// Filtering + the payload a future backend would receive. One place decides what "in the period" means.
import type { IsoDate } from "@/lib/date-range/dates";

/** Inclusive on both ends. Works on any records that carry a yyyy-mm-dd `date`. */
export function filterByRange<T extends { date: string }>(list: T[], range: { startIso: IsoDate; endIso: IsoDate }): T[] {
  return list.filter((t) => t.date >= range.startIso && t.date <= range.endIso);
}

/** What API calls should send (e.g. `GET /transactions?startDate=…&endDate=…`). */
export function rangeToQuery(range: { startIso: IsoDate; endIso: IsoDate }) {
  return { startDate: range.startIso, endDate: range.endIso };
}
