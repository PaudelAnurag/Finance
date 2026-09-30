// Normalizes a JSON API response into the same CSV shape the CSV upload uses,
// so it goes through the identical parser + validator (analyzeCsv) — one
// engine, one set of error messages, for both import paths.
import { csvSpec } from "@/data/mock-upload";
import { buildCsv } from "@/lib/csv/analyze";

const REQUIRED = csvSpec.requiredColumns.map((c) => c.name);

const ALIASES: Record<string, string[]> = {
  date: ["date", "transactiondate", "txndate", "postingdate", "createdat"],
  description: ["description", "desc", "memo", "details", "narration", "name", "title"],
  category: ["category", "categoryname", "tag"],
  type: ["type", "transactiontype", "direction", "kind"],
  amount: ["amount", "value", "amt", "total"],
  status: ["status", "state"],
};

const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");

function fieldFor(record: Record<string, unknown>, column: string): string {
  const wanted = new Set((ALIASES[column] ?? [column]).map(normalizeKey));
  for (const key of Object.keys(record)) {
    if (wanted.has(normalizeKey(key))) {
      const v = record[key];
      if (v === null || v === undefined) return "";
      return String(v);
    }
  }
  return "";
}

export interface JsonToCsvResult {
  csv: string | null;
  error: string | null;
}

/** Accepts an array of objects, or `{ transactions: [...] }` / `{ data: [...] }` wrappers. */
export function jsonToCsv(payload: unknown): JsonToCsvResult {
  let records = payload;
  if (records && typeof records === "object" && !Array.isArray(records)) {
    const obj = records as Record<string, unknown>;
    records = obj.transactions ?? obj.data ?? obj.rows ?? obj.results ?? records;
  }
  if (!Array.isArray(records)) {
    return { csv: null, error: "Expected the API to return a JSON array of transactions (or { transactions: [...] })." };
  }
  if (records.length === 0) {
    return { csv: null, error: "The API returned zero transactions." };
  }
  if (!records.every((r) => r && typeof r === "object" && !Array.isArray(r))) {
    return { csv: null, error: "Every item in the response must be a transaction object." };
  }
  const rows = (records as Record<string, unknown>[]).map((r) => REQUIRED.map((col) => fieldFor(r, col)));
  return { csv: buildCsv(rows, REQUIRED), error: null };
}
