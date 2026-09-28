"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export function Toast({
  message,
  detail,
  onClose,
  children,
}: {
  message: string;
  detail?: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 8000);
    return () => window.clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex w-[min(24rem,calc(100vw-3rem))] items-start gap-3 rounded-xl border bg-card p-4 shadow-xl"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-positive" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1 text-sm">
        <p className="font-medium">{message}</p>
        {detail && <p className="text-[13px] text-muted-foreground">{detail}</p>}
        {children}
      </div>
      <button aria-label="Dismiss" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
        <X className="size-4" />
      </button>
    </div>
  );
}
