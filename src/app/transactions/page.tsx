"use client";

import { ArrowDownRight, ArrowUpRight, Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { KpiCard } from "@/components/shell/kpi-card";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchInput } from "@/components/ui/search-input";
import {
  TransactionFilter,
  TransactionSort,
  transactionFilters,
  transactionSortOptions,
} from "@/data/mock-transactions";
import { useMoney } from "@/lib/currency";
import { useDataset, useDatasetActions } from "@/lib/dataset/context";
import {
  filterTransactions,
  formatShortDate,
  latestDate,
  signedAmount,
  sortTransactions,
  summarize,
} from "@/lib/transactions";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const { fmt, signed } = useMoney();
  const { transactions: items } = useDataset();
  const { addTransaction } = useDatasetActions();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("All");
  const [sort, setSort] = useState<TransactionSort>("date-desc");
  const [open, setOpen] = useState(false);

  const totals = useMemo(() => summarize(items), [items]);
  const visible = useMemo(
    () => sortTransactions(filterTransactions(items, filter, query), sort),
    [items, filter, query, sort],
  );

  function add(t: Parameters<typeof addTransaction>[0]) {
    addTransaction(t);
    setOpen(false);
  }

  return (
    <AppShell
      title="Transactions"
      subtitle="View and manage your financial activity"
      action={
        <Button variant="accent" onClick={() => setOpen(true)}>
          <Plus /> Add Transaction
        </Button>
      }
    >
      <section aria-label="Transaction summary" className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total Income" value={fmt(totals.income, { compact: true })} icon={ArrowUpRight} tone="green" />
        <KpiCard label="Total Expenses" value={fmt(totals.expenses, { compact: true })} icon={ArrowDownRight} tone="red" />
        <KpiCard
          label="Net Cash Flow"
          value={signed(totals.net, { compact: true, showPlus: true })}
          icon={Wallet}
          tone="blue"
          valueClassName={totals.net < 0 ? "text-negative" : "text-positive"}
        />
      </section>

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-5">
          <SearchInput
            aria-label="Search transactions"
            placeholder="Search transactions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterChips label="Filter transactions" options={transactionFilters} value={filter} onChange={setFilter} />
            <Select
              aria-label="Sort transactions"
              value={sort}
              onChange={(e) => setSort(e.target.value as TransactionSort)}
              className="lg:w-52"
            >
              {transactionSortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-t text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Description</th>
                <th className="px-5 py-2.5 font-medium">Category</th>
                <th className="px-5 py-2.5 font-medium">Type</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className="border-t hover:bg-muted/50">
                  <td className="px-5 py-3 text-muted-foreground">{formatShortDate(t.date)}</td>
                  <td className="px-5 py-3 font-medium">{t.description}</td>
                  <td className="px-5 py-3 text-muted-foreground">{t.category}</td>
                  <td className="px-5 py-3">
                    <Badge tone={t.type === "Income" ? "green" : "red"}>{t.type}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={t.status === "Pending" ? "orange" : "gray"}>{t.status}</Badge>
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-medium tabular-nums",
                      t.type === "Income" ? "text-positive" : "text-negative",
                    )}
                  >
                    {signed(signedAmount(t), { showPlus: true })}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr className="border-t">
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No transactions match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddTransactionModal open={open} defaultDate={latestDate(items)} onClose={() => setOpen(false)} onAdd={add} />
    </AppShell>
  );
}
