import { round2 } from "@/lib/money";

// Deterministic formatting helpers. No AI, no hardcoded display strings in
// components — components pass raw numbers + the active currency code,
// this layer turns them into text. Phase 1: tag/prefix only, no FX conversion.

export function formatMoney(value: number, currency: string, { compact = false }: { compact?: boolean } = {}) {
  if (!compact) return `${currency} ${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(2)}m`;
  if (abs >= 1_000) return `${currency} ${(value / 1_000).toFixed(1)}k`;
  return `${currency} ${value}`;
}

export function formatPct(value: number, { signed = false }: { signed?: boolean } = {}) {
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDelta(delta: Delta, currency: string): string {
  switch (delta.type) {
    case "pct":
      return `${delta.value > 0 ? "+" : ""}${delta.value.toFixed(1)}%`;
    case "pts":
      return `${delta.value > 0 ? "+" : ""}${delta.value.toFixed(1)} pts`;
    case "months":
      return `${delta.value > 0 ? "+" : ""}${delta.value.toFixed(1)} mo`;
    case "currency":
      return `${delta.value > 0 ? "+" : ""}${formatMoney(delta.value, currency, { compact: true })}`;
  }
}

export type Delta =
  | { type: "pct"; value: number }
  | { type: "pts"; value: number }
  | { type: "months"; value: number }
  | { type: "currency"; value: number };

export function formatSignedMoney(
  value: number,
  currency: string,
  { compact = false, showPlus = false }: { compact?: boolean; showPlus?: boolean } = {},
) {
  const sign = value < 0 ? "-" : showPlus && value > 0 ? "+" : "";
  return `${sign}${formatMoney(Math.abs(value), currency, { compact })}`;
}

/** Text can carry money as `{m:1234.5}`; it is rendered with the active currency at display time. */
export const moneyToken = (n: number) => `{m:${round2(n)}}`;

export function renderMoneyTokens(text: string, currency: string) {
  return text.replace(/\{m:(-?\d+(?:\.\d+)?)\}/g, (_, n) => formatSignedMoney(Number(n), currency, { compact: true }));
}
