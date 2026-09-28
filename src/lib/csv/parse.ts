// Minimal RFC 4180 CSV parser. Handles BOM, CRLF/LF/CR, quoted fields with
// commas, escaped quotes ("") and newlines inside quotes. Tracks the FILE LINE
// each record starts on so validation messages can cite real row numbers.

export interface CsvRecord {
  line: number;
  cells: string[];
}

export interface CsvParseResult {
  records: CsvRecord[];
  error?: { line: number; message: string };
}

export function parseCsv(input: string): CsvParseResult {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const records: CsvRecord[] = [];
  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let quoteStartLine = 1;
  let line = 1;
  let recordLine = 1;
  let i = 0;

  const endRecord = () => {
    cells.push(field);
    records.push({ line: recordLine, cells });
    cells = [];
    field = "";
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
        continue;
      }
      if (ch === "\n") line++;
      field += ch;
      i++;
      continue;
    }

    if (ch === '"' && field === "") {
      inQuotes = true;
      quoteStartLine = line;
      i++;
    } else if (ch === ",") {
      cells.push(field);
      field = "";
      i++;
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      i++;
      endRecord();
      line++;
      recordLine = line;
    } else {
      field += ch;
      i++;
    }
  }

  if (inQuotes) {
    return {
      records,
      error: { line: quoteStartLine, message: `A quoted value starting on line ${quoteStartLine} is never closed.` },
    };
  }
  if (field !== "" || cells.length > 0) endRecord();
  return { records };
}
