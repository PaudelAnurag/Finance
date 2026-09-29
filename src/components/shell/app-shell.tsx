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
    <div className="min-h-screen">
      <Sidebar />
      {/* Fixed sidebar (see above) is taken out of flow, so this column is offset
          by its width and scrolls independently — the sidebar never moves. */}
      <div className="flex min-h-screen min-w-0 flex-col md:pl-64">
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
