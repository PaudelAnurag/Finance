"use client";

import { Database, Plug, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { ValidationPanel } from "@/components/upload/validation-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { connectedSources, sampleCsvRows, sampleCsvWithErrors, uploadConstraints } from "@/data/mock-upload";
import { CsvAnalysis, analyzeCsv, buildCsv } from "@/lib/csv/analyze";
import { useDataset, useDatasetActions } from "@/lib/dataset/context";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function rejectFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return `${file.name}: Excel import is coming later. Export the sheet as CSV and upload that.`;
  }
  if (!name.endsWith(".csv")) return `${file.name}: only CSV files (.csv) are supported.`;
  if (file.size === 0) return `${file.name}: the file is empty.`;
  if (file.size > uploadConstraints.maxSizeMB * 1024 * 1024) {
    return `${file.name}: exceeds the ${uploadConstraints.maxSizeMB} MB limit (${formatSize(file.size)}).`;
  }
  return null;
}

/** Why a parsed file may not be applied (null = safe to apply). */
function blockingProblem(a: CsvAnalysis): string | null {
  if (a.fatalError) return a.fatalError;
  if (a.issues.some((i) => i.severity === "error")) return "Fix the errors below and upload again — nothing was changed.";
  if (a.validRows === 0) return "No valid transactions were found — nothing was changed.";
  if (a.checks.some((c) => !c.passed)) return "Internal consistency check failed — nothing was changed.";
  return null;
}

export default function UploadDataPage() {
  const dataset = useDataset();
  const { applyCsv, clearCsv, fileSizeBytes } = useDatasetActions();
  const [checked, setChecked] = useState<CsvAnalysis | null>(null); // last file that was checked
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; detail: string } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  function process(text: string, fileName: string, sizeBytes: number) {
    const analysis = analyzeCsv(text, { fileName, fileSizeBytes: sizeBytes });
    setChecked(analysis);
    setToast(null);
    if (blockingProblem(analysis)) return;

    const { persisted } = applyCsv(analysis);
    const warnings = analysis.issues.filter((i) => i.severity === "warning").length;
    setToast({
      message: "All dashboards updated",
      detail:
        `${analysis.validRows} transactions from ${fileName} now drive Dashboard, Ask Finance AI, Cash Flow, Transactions and Reports.` +
        (warnings ? ` ${warnings} warning${warnings === 1 ? "" : "s"} noted below.` : "") +
        (persisted ? "" : " Too large to keep across a page refresh — it stays available until you reload."),
    });
  }

  async function handleFiles(files: FileList) {
    setError(null);
    const file = files[0];
    const problem = rejectFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      const text = await file.text();
      await new Promise((r) => setTimeout(r, 0)); // let "Reading…" paint
      process(text, file.name, file.size);
      if (files.length > 1) setError(`Only one file at a time — used ${file.name}, ignored the rest.`);
    } catch {
      setError(`${file.name}: could not be read.`);
    } finally {
      setBusy(false);
    }
  }

  function runSample(text: string, fileName: string) {
    setError(null);
    process(text, fileName, new Blob([text]).size);
  }

  function downloadSample() {
    const url = URL.createObjectURL(new Blob([buildCsv(sampleCsvRows)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const problem = checked ? blockingProblem(checked) : null;
  const showPanel = checked && (problem !== null || checked.issues.length > 0);
  const usingCsv = dataset.source === "csv";

  return (
    <AppShell title="Upload Data" subtitle="Import your financial data">
      <div className="space-y-6">
        <UploadDropzone
          busy={busy}
          error={error}
          onFiles={handleFiles}
          onSample={() => runSample(buildCsv(sampleCsvRows), "sample-transactions.csv")}
          onSampleWithErrors={() => runSample(sampleCsvWithErrors, "sample-with-errors.csv")}
          onDownloadSample={downloadSample}
        />

        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 pt-5">
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-accent">
              <Database className="size-4" />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              {usingCsv ? (
                <>
                  <p className="font-medium">
                    Using {dataset.fileName} <span className="font-normal text-muted-foreground">· {formatSize(fileSizeBytes)}</span>
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {dataset.transactions.length} transactions cached in this browser tab. Every page is built from them.{" "}
                    <Link href="/" className="font-medium text-accent hover:underline">
                      View dashboard
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Using demo data</p>
                  <p className="text-[13px] text-muted-foreground">Upload a valid CSV and every page updates from it.</p>
                </>
              )}
            </div>
            {usingCsv && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearCsv();
                  setChecked(null);
                  setToast(null);
                }}
              >
                <Trash2 /> Clear uploaded data
              </Button>
            )}
          </CardContent>
        </Card>

        {showPanel && (
          <>
            {problem && !checked.fatalError && (
              <p role="alert" className="rounded-lg border border-negative/30 bg-[var(--badge-red-bg)] px-4 py-3 text-sm">
                {problem}
              </p>
            )}
            <ValidationPanel a={checked} />
          </>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-foreground">Connected Sources</h2>
          </CardHeader>
          <CardContent className="divide-y">
            {connectedSources.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Plug className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="gray">{s.status}</Badge>
                  <Button size="sm" variant="outline" disabled title="Integrations arrive after the backend is built">
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {toast && (
        <Toast message={toast.message} detail={toast.detail} onClose={closeToast}>
          <Link href="/" className="text-[13px] font-medium text-accent hover:underline">
            Go to dashboard →
          </Link>
        </Toast>
      )}
    </AppShell>
  );
}
