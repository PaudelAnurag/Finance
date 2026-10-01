// The ONE place for money and percentage arithmetic.
// Amounts are stored as integer MINOR units (x100) so sums never drift (0.1 + 0.2 === 0.3).

/** Rounds a major-unit amount to 2 decimals. */
export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Major units (12.34) → integer minor units (1234). */
export const toMinor = (major: number) => Math.round(major * 100);

/** Integer minor units (1234) → major units (12.34). */
export const fromMinor = (minor: number) => round2(minor / 100);

/** Percent change from `prev` to `cur`. `null` when there is no prior figure to compare against. */
export const pctChange = (prev: number, cur: number) => (prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100);
