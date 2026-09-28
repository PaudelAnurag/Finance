import { LineChart } from "lucide-react";

import { authBrand } from "@/data/mock-auth";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sidebar">
            <LineChart className="size-6 text-white" />
          </div>
          <p className="text-lg font-semibold tracking-tight">{authBrand.appName}</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}
