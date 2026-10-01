"use client";

import { useState } from "react";

import { ApiConnectionSection } from "@/components/settings/api-connection-section";
import { BusinessSection } from "@/components/settings/business-section";
import { DataSourcesSection } from "@/components/settings/data-sources-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { AppSettings, useSettings } from "@/lib/settings";

// Each section owns its own state; this page only holds the company/notification draft behind "Save changes".
export default function SettingsPage() {
  const { settings, save } = useSettings();

  const [draft, setDraft] = useState<Partial<AppSettings>>({});
  const [saved, setSaved] = useState<null | boolean>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const value: AppSettings = {
    ...settings,
    ...draft,
    notifications: { ...settings.notifications, ...draft.notifications },
  };

  const edit = (patch: Partial<AppSettings>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(null);
  };

  function commit() {
    const companyName = value.companyName.trim();
    if (!companyName) {
      setNameError("Company name can't be empty.");
      return;
    }
    setNameError(null);
    const persisted = save({ ...value, companyName });
    setDraft({});
    setSaved(persisted);
  }

  return (
    <AppShell title="Settings" subtitle="Manage your business and Finance AI preferences">
      <BusinessSection value={value} nameError={nameError} onChange={edit} />
      <ApiConnectionSection />
      <DataSourcesSection />
      <NotificationsSection value={value.notifications} onChange={(notifications) => edit({ notifications })} />

      <div className="mt-6 flex items-center justify-end gap-3">
        {saved !== null && (
          <p role="status" className="text-[13px] text-muted-foreground">
            {saved
              ? "Saved — company name and preferences are applied across all pages (stored in this browser)."
              : "Applied for this session, but this browser blocked saving it."}
          </p>
        )}
        <Button variant="accent" onClick={commit}>
          Save changes
        </Button>
      </div>
    </AppShell>
  );
}
