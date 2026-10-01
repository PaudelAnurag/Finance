import { fromMinor, toMinor } from "@/lib/money";
import type {
  Transaction,
  TransactionFilter,
  TransactionSort,
} from "@/data/mock-transactions";

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

/** Income / expense / net of a transaction list, in major units. Summed in minor units so decimals never drift. */
export function incomeExpenseTotals(list: Transaction[]) {
  const income = list.filter((t) => t.type === "Income").reduce((s, t) => s + toMinor(t.amount), 0);
  const expenses = list.filter((t) => t.type === "Expense").reduce((s, t) => s + toMinor(t.amount), 0);
  return { income: fromMinor(income), expenses: fromMinor(expenses), net: fromMinor(income - expenses) };
}

export function signedAmount(t: Transaction) {
  return t.type === "Income" ? t.amount : -t.amount;
}
