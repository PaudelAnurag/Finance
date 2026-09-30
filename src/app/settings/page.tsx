"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import {
  companySizeOptions,
  dataSources,
  fiscalYearOptions,
  forecastPeriodOptions,
  industryOptions,
  notificationOptions,
  responseStyleOptions,
  securityItems,
} from "@/data/mock-settings";
import { currencyOptions, useCurrency } from "@/lib/currency";
import { AppSettings, useSettings } from "@/lib/settings";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mt-6 first:mt-0">
      <CardHeader>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}

function Row({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-2 py-3 sm:grid-cols-[200px_1fr]">
      <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="sm:max-w-sm">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();
  const { settings, save } = useSettings();
  // Edits are held as a draft and only applied to every page when "Save changes" is pressed.
  const [draft, setDraft] = useState<Partial<AppSettings>>({});
  const [saved, setSaved] = useState<null | boolean>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const value: AppSettings = { ...settings, ...draft, notifications: { ...settings.notifications, ...draft.notifications } };
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
      <Section title="Business">
        <Row label="Company Name" htmlFor="company">
          <Input id="company" value={value.companyName} onChange={(e) => edit({ companyName: e.target.value })} aria-invalid={!!nameError} />
          {nameError && (
            <p role="alert" className="mt-1 text-xs text-negative">
              {nameError}
            </p>
          )}
        </Row>
        <Row label="Industry" htmlFor="industry">
          <Select id="industry" value={value.industry} onChange={(e) => edit({ industry: e.target.value })}>
            {industryOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row>
        <Row label="Currency" htmlFor="currency">
          <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </Select>
        </Row>
        {/* <Row label="Fiscal Year" htmlFor="fiscal">
          <Select id="fiscal" value={value.fiscalYear} onChange={(e) => edit({ fiscalYear: e.target.value })}>
            {fiscalYearOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row> */}
        {/* <Row label="Company Size" htmlFor="size">
          <Select id="size" value={value.companySize} onChange={(e) => edit({ companySize: e.target.value })}>
            {companySizeOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row> */}
      </Section>

      <Section title="API Connection">
        <p className="pb-3 pt-1 text-[13px] text-muted-foreground">
          Point this at your own company&apos;s data API. Nothing is hardcoded — each company sets its own URL and key
          here, used only from the Upload Data page.
        </p>
        <Row label="API URL" htmlFor="api-url">
          <Input
            id="api-url"
            type="url"
            placeholder="https://api.yourcompany.com/transactions"
            value={value.apiUrl}
            onChange={(e) => edit({ apiUrl: e.target.value })}
          />
        </Row>
        <Row label="Auth Header" htmlFor="api-header">
          <Input
            id="api-header"
            placeholder="Authorization"
            value={value.apiKeyHeader}
            onChange={(e) => edit({ apiKeyHeader: e.target.value })}
          />
        </Row>
        <Row label="API Key" htmlFor="api-key">
          <Input
            id="api-key"
            type="password"
            autoComplete="off"
            placeholder="Sent as the header above"
            value={value.apiKey}
            onChange={(e) => edit({ apiKey: e.target.value })}
          />
        </Row>
        <p className="pt-3 text-xs text-muted-foreground">
          The key is stored only in this browser (never sent anywhere but your API). Expected response: a JSON array of
          transactions with date, description, category, type, amount, status.
        </p>
      </Section>

      <Section title="Data Sources">
        {dataSources.map((d) => (
          <div key={d.name} className="flex items-center justify-between py-3 text-sm">
            <span>{d.name}</span>
            <Badge tone={d.status === "Available" ? "green" : "gray"}>{d.status}</Badge>
          </div>
        ))}
        <div className="flex items-center justify-between py-3 text-sm">
          <span>API</span>
          <Badge tone={value.apiUrl ? "green" : "gray"}>{value.apiUrl ? "Configured" : "Not configured"}</Badge>
        </div>
      </Section>

      {/* <Section title="AI Settings">
        <Row label="Forecast Period" htmlFor="forecast">
          <Select id="forecast" value={value.forecastPeriod} onChange={(e) => edit({ forecastPeriod: e.target.value })}>
            {forecastPeriodOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row>
        <Row label="AI Response" htmlFor="response">
          <Select id="response" value={value.responseStyle} onChange={(e) => edit({ responseStyle: e.target.value })}>
            {responseStyleOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row>
      </Section> */}

      {/* <Section title="Notifications">
        {notificationOptions.map((n) => (
          <label key={n.id} className="flex cursor-pointer items-center gap-3 py-3 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={value.notifications[n.id] ?? false}
              onChange={(e) => edit({ notifications: { ...value.notifications, [n.id]: e.target.checked } })}
            />
            {n.label}
          </label>
        ))}
      </Section> */}

      {/* <Section title="Security">
        {securityItems.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-3 text-sm">
            <span className="text-muted-foreground">{s.label}</span>
            <span>{s.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-3 text-sm">
          <span className="text-muted-foreground">Password</span>
          <Link href="/forgot-password" className="font-medium text-accent hover:underline">
            Change password
          </Link>
        </div>
      </Section> */}

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
