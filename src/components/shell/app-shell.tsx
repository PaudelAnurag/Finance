import { DataBanner } from "@/components/shell/data-banner";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="min-w-0 flex-1 px-6 pb-10 md:px-10">
          <DataBanner />
          {action && <div className="mb-4 flex justify-end">{action}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
