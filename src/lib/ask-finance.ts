// Deterministic helpers for Ask Finance answers (pure functions of dataset.ask).
import type { AskData } from "@/lib/dataset/types";

export function biggestExpense(items: AskData["expenses"]["items"]) {
  return [...items].sort((a, b) => b.amount - a.amount)[0] ?? null;
}

export function expenseTotal(items: AskData["expenses"]["items"]) {
  return items.reduce((s, e) => s + e.amount, 0);
}

export function expenseDeltaTotal(items: AskData["expenses"]["items"]) {
  return items.reduce((s, e) => s + e.deltaFromPrior, 0);
}
