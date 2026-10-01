"use client";

import { useState } from "react";

import { Row, Section } from "@/components/settings/settings-layout";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { ApiSettings, useApiSettings } from "@/lib/api-settings";

export function ApiConnectionSection() {
  const { apiSettings, save } = useApiSettings();
  const [draft, setDraft] = useState<Partial<ApiSettings>>({});
  const [saved, setSaved] = useState<null | boolean>(null);

  const value: ApiSettings = { ...apiSettings, ...draft };

  const edit = (patch: Partial<ApiSettings>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(null);
  };

  function commit() {
    const persisted = save(value);
    setDraft({});
    setSaved(persisted);
  }

  return (
    <Section title="API Connection">
      <Row label="API URL" htmlFor="api-url">
        <Input
          id="api-url"
          placeholder="/api/transactions (or https://api.yourcompany.com/transactions)"
          value={value.url}
          onChange={(e) => edit({ url: e.target.value })}
        />
      </Row>

      <Row label="Authentication" htmlFor="api-auth-scheme">
        <Select
          id="api-auth-scheme"
          value={value.authScheme}
          onChange={(e) => edit({ authScheme: e.target.value as ApiSettings["authScheme"] })}
        >
          <option value="none">None</option>
          <option value="bearer">Bearer Token</option>
          <option value="header">Custom Header</option>
        </Select>
      </Row>

      {value.authScheme === "header" && (
        <Row label="Header Name" htmlFor="api-header-name">
          <Input
            id="api-header-name"
            placeholder="x-api-key"
            value={value.headerName}
            onChange={(e) => edit({ headerName: e.target.value })}
          />
        </Row>
      )}

      {value.authScheme !== "none" && (
        <Row label="API Key" htmlFor="api-key">
          <Input
            id="api-key"
            type="password"
            autoComplete="off"
            placeholder={value.authScheme === "bearer" ? "Sent as Authorization: Bearer <key>" : "Sent as the header above"}
            value={value.apiKey}
            onChange={(e) => edit({ apiKey: e.target.value })}
          />
        </Row>
      )}

      <div className="flex items-center justify-between py-3">
        <p className="text-xs text-muted-foreground">
          {value.authScheme === "none"
            ? "No authentication header will be sent."
            : value.authScheme === "bearer"
              ? "Sends: Authorization: Bearer <your key>"
              : `Sends: ${value.headerName || "x-api-key"}: <your key>`}
        </p>
        <Button size="sm" variant="outline" onClick={commit}>
          Save API settings
        </Button>
      </div>

      {saved !== null && (
        <p role="status" className="pb-1 pt-1 text-[13px] text-muted-foreground">
          {saved ? "Saved." : "Applied for this session, but this browser blocked saving it."}
        </p>
      )}
    </Section>
  );
}
