"use client";

import { Download, Loader2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { csvSpec, supportedFormats, uploadConstraints } from "@/data/mock-upload";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  busy,
  error,
  onFiles,
  onSample,
  onSampleWithErrors,
  onDownloadSample,
}: {
  busy: boolean;
  error: string | null;
  onFiles: (files: FileList) => void;
  onSample: () => void;
  onSampleWithErrors: () => void;
  onDownloadSample: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
        <p className="text-[15px] font-semibold">Upload your financial file</p>

        <div
          role="button"
          tabIndex={0}
          aria-disabled={busy}
          aria-label="Drop a CSV file here, or press Enter to browse"
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!busy && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) onFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full max-w-md cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dragging ? "border-accent bg-[var(--badge-blue-bg)]" : "border-input hover:bg-muted",
            busy && "cursor-wait opacity-70",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-[var(--badge-blue-bg)] text-accent">
            {busy ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
          </span>
          <p className="text-sm font-medium">{busy ? "Reading file…" : "Drop CSV here"}</p>
          {!busy && (
            <p className="text-[13px] text-muted-foreground">
              or <span className="text-accent underline">Browse</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">CSV</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <p className="text-xs text-muted-foreground">Maximum file size: {uploadConstraints.maxSizeMB} MB</p>
        <div className="flex flex-wrap justify-center gap-2">
          {supportedFormats.map((f) => (
            <Badge key={f.label} tone={f.status === "Available" ? "green" : "gray"}>
              {f.label}: {f.status}
            </Badge>
          ))}
        </div>

        {error && (
          <p role="alert" className="max-w-md text-[13px] text-negative">
            {error}
          </p>
        )}

        <div className="w-full max-w-xl rounded-lg bg-muted p-4 text-left">
          <p className="text-xs font-medium">Required columns (header row, any order)</p>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
            {csvSpec.requiredColumns.map((c) => (
              <li key={c.name}>
                <code className="font-mono text-foreground">{c.name}</code> — {c.hint}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" onClick={onDownloadSample}>
            <Download /> Download sample CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={onSample} disabled={busy}>
            Try sample data
          </Button>
          <Button size="sm" variant="secondary" onClick={onSampleWithErrors} disabled={busy}>
            Try sample with errors
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Files are read and calculated in your browser only. Nothing is uploaded or stored.
        </p>
      </CardContent>
    </Card>
  );
}
