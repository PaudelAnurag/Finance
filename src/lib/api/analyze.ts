// Fetches a company's own API (configured in Settings, never hardcoded) and
// runs it through the SAME validation, totals and checks as a CSV upload —
// so Upload Data, the dashboards and the cache behave identically either way.
import type { ApiSettings } from "@/lib/api-settings";
import { base, buildChecks, fatal, summarize, type CsvAnalysis, type ParsedTransaction } from "@/lib/csv/analyze";
import { getPath, toText } from "@/lib/api/path";
import { validateRecord } from "@/lib/records/validate";

export interface ApiFetchResult {
  analysis: CsvAnalysis;
  status?: number;
}

function authHeaders(cfg: ApiSettings): HeadersInit {
  if (cfg.authScheme === "bearer" && cfg.apiKey) return { Authorization: `Bearer ${cfg.apiKey}` };
  if (cfg.authScheme === "header" && cfg.apiKey) return { [cfg.headerName || "x-api-key"]: cfg.apiKey };
  return {};
}

const sourceLabel = (cfg: ApiSettings) => (cfg.name.trim() ? cfg.name.trim() : cfg.url);

export async function fetchAndAnalyzeApi(cfg: ApiSettings, signal?: AbortSignal): Promise<ApiFetchResult> {
  const meta = { fileName: sourceLabel(cfg), fileSizeBytes: 0 };
  if (!cfg.url.trim()) return { analysis: fatal(meta, "No API URL is configured. Set one in Settings → Integration API.") };

  let res: Response;
  try {
    res = await fetch(cfg.url, { headers: { Accept: "application/json", ...authHeaders(cfg) }, signal });
  } catch {
    return { analysis: fatal(meta, "Could not reach the API. Check the URL and that it allows requests from this browser (CORS).") };
  }
  if (!res.ok) {
    return {
      analysis: fatal(meta, `The API returned an error: ${res.status} ${res.statusText || ""}`.trim()),
      status: res.status,
    };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { analysis: fatal(meta, "The API did not return valid JSON.") };
  }

  const rawArray = getPath(json, cfg.responsePath);
  if (!Array.isArray(rawArray)) {
    return {
      analysis: fatal(
        meta,
        cfg.responsePath.trim()
          ? `No array was found at response path "${cfg.responsePath}".`
          : "The API response is not a JSON array. Set a response path in Settings if the array is nested (e.g. \"data.transactions\").",
      ),
    };
  }
  if (rawArray.length === 0) return { analysis: fatal(meta, "The API returned zero transactions.") };

  const map = cfg.fieldMap;
  const inferTypeFromSign = !map.type.trim();
  const inferStatus = !map.status.trim();

  const result = base(meta);
  result.headerOk = true;
  result.totalDataRows = rawArray.length;

  const seen = new Map<string, number>();

  rawArray.forEach((raw, i) => {
    const row = i + 1; // 1 = first record (an API has no header row)
    if (raw === null || typeof raw !== "object") {
      result.invalidRows++;
      result.issues.push({ row, severity: "error", message: "Record is not a JSON object" });
      return;
    }
    const obj = raw as Record<string, unknown>;
    const field = (key: keyof typeof map) => toText(obj[map[key] || key]);

    let typeText = field("type");
    let amountText = field("amount");
    if (inferTypeFromSign) {
      const n = Number(amountText.replace(/,/g, ""));
      if (!Number.isFinite(n)) {
        result.invalidRows++;
        result.issues.push({ row, severity: "error", message: `Invalid amount: "${amountText}"` });
        return;
      }
      typeText = n < 0 ? "expense" : "income";
      amountText = String(Math.abs(n));
    }
    const statusText = inferStatus ? "Completed" : field("status");

    const outcome = validateRecord(
      (f) => (f === "type" ? typeText : f === "amount" ? amountText : f === "status" ? statusText : field(f)),
      { incomeWord: inferTypeFromSign ? "income" : cfg.incomeWord, expenseWord: inferTypeFromSign ? "expense" : cfg.expenseWord },
    );

    if ("errors" in outcome) {
      result.invalidRows++;
      for (const message of outcome.errors) result.issues.push({ row, severity: "error", message });
      return;
    }

    const r = outcome.record;
    const tx: ParsedTransaction = { row, ...r };
    const key = [r.date, r.description.toLowerCase(), r.category.toLowerCase(), r.type, r.amountMinor].join("|");
    const first = seen.get(key);
    if (first !== undefined) {
      tx.duplicateOf = first;
      result.issues.push({ row, severity: "warning", message: `Possible duplicate of record ${first} (still included in totals)` });
    } else {
      seen.set(key, row);
    }
    result.transactions.push(tx);
    result.validRows++;
  });

  result.summary = summarize(result.transactions);
  return { analysis: { ...result, checks: buildChecks(result) } };
}
