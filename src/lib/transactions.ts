import type {
  Transaction,
  TransactionFilter,
  TransactionSort,
} from "@/data/mock-transactions";

export function formatShortDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function filterTransactions(list: Transaction[], filter: TransactionFilter, query: string) {
  const q = query.trim().toLowerCase();
  return list.filter((t) => {
    const matchesFilter = filter === "All" || filter === t.type || filter === t.status;
    const matchesQuery = !q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });
}

export function sortTransactions(list: Transaction[], sort: TransactionSort) {
  const copy = [...list];
  switch (sort) {
    case "date-desc":
      return copy.sort((a, b) => b.date.localeCompare(a.date));
    case "date-asc":
      return copy.sort((a, b) => a.date.localeCompare(b.date));
    case "amount-desc":
      return copy.sort((a, b) => b.amount - a.amount);
    case "amount-asc":
      return copy.sort((a, b) => a.amount - b.amount);
  }
}

// Sums in integer minor units so decimals never drift (0.1 + 0.2 === 0.3).
export const toMinor = (amount: number) => Math.round(amount * 100);

export function summarize(list: Transaction[]) {
  const income = list.filter((t) => t.type === "Income").reduce((s, t) => s + toMinor(t.amount), 0);
  const expenses = list.filter((t) => t.type === "Expense").reduce((s, t) => s + toMinor(t.amount), 0);
  return { income: income / 100, expenses: expenses / 100, net: (income - expenses) / 100 };
}

export function latestDate(list: Transaction[]) {
  return list.reduce((max, t) => (t.date > max ? t.date : max), list[0]?.date ?? "");
}

export function signedAmount(t: Transaction) {
  return t.type === "Income" ? t.amount : -t.amount;
}

export function formatMonth(yearMonth: string) {
  return new Date(`${yearMonth}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
