// Resolves a dot/bracket path like "data.transactions" or "result[0].rows"
// against an arbitrary API response. Every company's API shapes this array
// differently, so the path is configurable instead of assumed.
export function getPath(obj: unknown, path: string): unknown {
  const trimmed = path.trim();
  if (!trimmed) return obj;
  const parts = trimmed
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cur: unknown = obj;
  for (const key of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/** JSON values coming back as numbers, booleans, null, etc. — normalized to text for the validators. */
export function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
}
