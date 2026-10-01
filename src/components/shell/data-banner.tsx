"use client";

import { Database } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDateRangeControls } from "@/lib/date-range/context";
import { useDataset, useDatasetActions } from "@/lib/dataset/context";

/** Shown on every page while uploaded CSV data (not the demo data) is driving the app. */
export function DataBanner() {
  const dataset = useDataset();
  const { clearCsv } = useDatasetActions();
  const { applyCustomRange } = useDateRangeControls();
  const pathname = usePathname();

  if (dataset.source !== "csv" || pathname === "/upload-data") return null;

  return (
    <div role="status" className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-accent/25 bg-[var(--badge-blue-bg)] px-4 py-2 text-[13px]">
      <Database className="size-4 shrink-0 text-accent" aria-hidden />
      <span>
        Showing your uploaded data: <span className="font-medium">{dataset.fileName}</span> · {dataset.transactions.length} of {dataset.totalTransactions} transactions in{" "}
        <span className="font-medium">{dataset.period?.label}</span>
        {dataset.transactions.length === 0 && dataset.dataBounds && (
          <>
            {" "}
            ·{" "}
            <button
              onClick={() => applyCustomRange(dataset.dataBounds!.start, dataset.dataBounds!.end)}
              className="font-medium text-accent hover:underline"
            >
              Show all data
            </button>
          </>
        )}
      </span>
      <span className="ml-auto flex items-center gap-3">
        <Link href="/upload-data" className="font-medium text-accent hover:underline">
          Upload another
        </Link>
        <button onClick={clearCsv} className="font-medium text-accent hover:underline">
          Reset to demo data
        </button>
      </span>
    </div>
  );
}
