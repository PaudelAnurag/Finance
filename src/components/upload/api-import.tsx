"use client";

import { Loader2, Plug, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useApiSettings } from "@/lib/api-settings";
// Single source of truth for the request: same fetch + same authHeaders()
// (none / bearer / header) that scripts/verify-api.ts exercises. No header
// building happens in this component anymore.
import { fetchAndAnalyzeApi } from "@/lib/api/analyze";
import type { CsvAnalysis } from "@/lib/csv/analyze";

export function ApiImport({ busy, onAnalysis }: { busy: boolean; onAnalysis: (analysis: CsvAnalysis) => void }) {
  const { apiSettings } = useApiSettings();
  const [fetching, setFetching] = useState(false);

  const configured = apiSettings.url.trim().length > 0;
  const isBusy = busy || fetching;

  async function run() {
    setFetching(true);
    try {
      const { analysis } = await fetchAndAnalyzeApi(apiSettings);
      onAnalysis(analysis);
    } finally {
      setFetching(false);
    }
  }

  const authLabel =
    apiSettings.authScheme === "bearer"
      ? "Authorization: Bearer …"
      : apiSettings.authScheme === "header"
        ? `${apiSettings.headerName || "x-api-key"}: …`
        : "No authentication";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-[15px] font-semibold text-foreground">Connect via API</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {configured ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-accent">
                <Plug className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{apiSettings.name.trim() || apiSettings.url}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {apiSettings.url} · {authLabel}
                </p>
              </div>
            </div>
            <Button onClick={run} disabled={isBusy} variant="accent" size="sm">
              {isBusy ? <Loader2 className="animate-spin" /> : <Plug />}
              {isBusy ? "Fetching…" : "Fetch & Import"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-accent">
              <SettingsIcon className="size-5" />
            </span>
            <p className="text-sm font-medium">No API configured yet</p>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Every company has a different data API, so this isn&apos;t built in — set your URL and auth in Settings first.
            </p>
            <Link href="/settings" className="text-[13px] font-medium text-accent hover:underline">
              Go to Settings →
            </Link>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Expected: a JSON array of transactions (path and field names configurable in Settings). Fetched and calculated in
          your browser only — nothing is stored on a server.
        </p>
      </CardContent>
    </Card>
  );
}
