// Field-level validators shared by EVERY ingestion path: CSV upload, API import, "Add transaction" form.
// Pure string in, typed value or error out — same rules everywhere data enters the app.
// This file also owns the canonical transaction vocabulary types; import them from here.
import { isValidIso } from "@/lib/date-range/dates";

export type TxType = "Income" | "Expense";
export type TxStatus = "Completed" | "Pending";

export const txTypes: readonly TxType[] = ["Income", "Expense"];
export const txStatuses: readonly TxStatus[] = ["Completed", "Pending"];

export function validateDate(raw: string): { value: string } | { error: string } {
  const date = raw.trim();
  if (!date) return { error: "Missing date" };
  if (!isValidIso(date)) return { error: `Invalid date: "${date}" (use YYYY-MM-DD)` };
  return { value: date };
}

export function validateAmount(raw: string): { minor: number } | { error: string } {
  const s = raw.trim();
  if (!s) return { error: "Missing amount" };
  if (s.startsWith("-")) return { error: `Amount must be positive: "${s}" (use the type column for direction)` };
  if (!/^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(s)) return { error: `Invalid amount: "${s}"` };
  // Parsed from the string (not Number * 100) so 1.15 can never become 114.99999.
  const [intPart, frac = ""] = s.replace(/,/g, "").split(".");
  if (frac.length > 2) return { error: `Invalid amount: "${s}" (maximum 2 decimal places)` };
  const minor = Number(intPart) * 100 + Number((frac + "00").slice(0, 2));
  if (minor <= 0) return { error: `Amount must be greater than 0: "${s}"` };
  if (!Number.isSafeInteger(minor)) return { error: `Amount is too large: "${s}"` };
  return { minor };
}

/** `incomeWord`/`expenseWord` let each source define its own vocabulary (e.g. "credit"/"debit"). */
export function validateType(
  raw: string,
  incomeWord = "income",
  expenseWord = "expense",
): { value: TxType } | { error: string } {
  const s = raw.trim().toLowerCase();
  if (!s) return { error: "Missing type" };
  if (s === incomeWord.toLowerCase()) return { value: "Income" };
  if (s === expenseWord.toLowerCase()) return { value: "Expense" };
  return { error: `Invalid type: "${raw}" (expected ${incomeWord} or ${expenseWord})` };
}

export function validateStatus(raw: string): { value: TxStatus } | { error: string } {
  const s = raw.trim().toLowerCase();
  if (!s) return { error: "Missing status" };
  if (s === "completed") return { value: "Completed" };
  if (s === "pending") return { value: "Pending" };
  return { error: `Invalid status: "${raw}" (expected Completed or Pending)` };
}

export interface ValidatedRecord {
  date: string;
  description: string;
  category: string;
  type: TxType;
  status: TxStatus;
  amountMinor: number;
}

/** `get` returns each logical field's raw text, however the source names its own columns/keys. */
export function validateRecord(
  get: (field: "date" | "description" | "category" | "type" | "amount" | "status") => string,
  opts: { incomeWord?: string; expenseWord?: string } = {},
): { record: ValidatedRecord } | { errors: string[] } {
  const errors: string[] = [];

  const date = validateDate(get("date"));
  if ("error" in date) errors.push(date.error);

  const description = get("description").trim();
  if (!description) errors.push("Missing description");

  const category = get("category").trim();
  if (!category) errors.push("Missing category");

  const type = validateType(get("type"), opts.incomeWord, opts.expenseWord);
  if ("error" in type) errors.push(type.error);

  const amount = validateAmount(get("amount"));
  if ("error" in amount) errors.push(amount.error);

  const status = validateStatus(get("status"));
  if ("error" in status) errors.push(status.error);

  if (errors.length || "error" in date || "error" in type || "error" in amount || "error" in status) {
    return { errors };
  }
  return {
    record: { date: date.value, description, category, type: type.value, status: status.value, amountMinor: amount.minor },
  };
}
