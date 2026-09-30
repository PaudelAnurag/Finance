"use client";

import { Loader2, Plug, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export function ApiImport({
  busy,
  error,
  onFetched,
}: {
  busy: boolean;
  error: string | null;
  onFetched: (text: string, sourceLabel: string) => void;
}) {
  const { settings } = useSettings();
  const [fetching, setFetching] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const configured = settings.apiUrl.trim().length > 0;
  let host = settings.apiUrl;
  try {
    host = configured ? new URL(settings.apiUrl).host : "";
  } catch {
    // leave as-is; treated as invalid below
  }

  async function run() {
    setLocalError(null);
    if (!configured) return;
    setFetching(true);
    try {
      const headers: Record<string, string> = {};
      if (settings.apiKey.trim()) headers[settings.apiKeyHeader.trim() || "Authorization"] = settings.apiKey.trim();
      const res = await fetch(settings.apiUrl, { headers });
      if (!res.ok) {
        setLocalError(`API returned ${res.status} ${res.statusText || ""}.`.trim());
        return;
      }
      const text = await res.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        setLocalError("The API did not return valid JSON.");
        return;
      }
      onFetched(JSON.stringify(json), `API: ${host || "your endpoint"}`);
    } catch {
      setLocalError(
        "Could not reach the API. Check the URL in Settings, and that the server allows requests from this browser (CORS).",
      );
    } finally {
      setFetching(false);
    }
  }

  const anyError = error ?? localError;
  const isBusy = busy || fetching;

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
                <p className="truncate text-sm font-medium">{settings.apiUrl}</p>
                <p className="text-xs text-muted-foreground">
                  Sent as <code className="font-mono">{settings.apiKeyHeader || "Authorization"}</code>
                  {settings.apiKey ? " (key set)" : " — no key set"}
                </p>
              </div>
            </div>
            <Button onClick={run} disabled={isBusy} variant="accent" size="sm">
              {isBusy ? <Loader2 className="animate-spin" /> : <Plug />}
              {isBusy ? "Fetching…" : "Fetch & Import"}
            </Button>
          </div>
        ) : (
          <div className={cn("flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center")}>
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-accent">
              <SettingsIcon className="size-5" />
            </span>
            <p className="text-sm font-medium">No API configured yet</p>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Every company has a different data API, so this isn&apos;t built in — set your URL and key in Settings first.
            </p>
            <Link href="/settings" className="text-[13px] font-medium text-accent hover:underline">
              Go to Settings →
            </Link>
          </div>
        )}

        {anyError && (
          <p role="alert" className="text-[13px] text-negative">
            {anyError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Expected: a JSON array of transactions (or <code className="font-mono">{"{ transactions: [...] }"}</code>), each with
          date, description, category, type, amount and status. Fetched and calculated in your browser only — nothing is stored
          on a server.
        </p>
      </CardContent>
    </Card>
  );
}
