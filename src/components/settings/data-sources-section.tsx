"use client";

import { Section } from "@/components/settings/settings-layout";
import { Badge } from "@/components/ui/badge";
import { dataSources } from "@/data/mock-settings";
import { useApiSettings } from "@/lib/api-settings";

export function DataSourcesSection() {
  const { apiSettings } = useApiSettings();
  const apiConfigured = apiSettings.url.trim().length > 0;

  return (
    <Section title="Data Sources">
      {dataSources.map((d) => (
        <div key={d.name} className="flex items-center justify-between py-3 text-sm">
          <span>{d.name}</span>
          <Badge tone={d.status === "Available" ? "green" : "gray"}>{d.status}</Badge>
        </div>
      ))}
      <div className="flex items-center justify-between py-3 text-sm">
        <span>API</span>
        <Badge tone={apiConfigured ? "green" : "gray"}>{apiConfigured ? "Configured" : "Not configured"}</Badge>
      </div>
    </Section>
  );
}
