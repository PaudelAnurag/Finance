"use client";

import { Info, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  dataSources,
  forecastPeriodOptions,
  industryOptions,
  notificationOptions,
  responseStyleOptions,
  securityItems,
} from "@/data/mock-settings";
import { ApiSettings, useApiSettings } from "@/lib/api-settings";
import { currencyOptions, useCurrency } from "@/lib/currency";
import { useToday } from "@/lib/date-range/context";
import { formatLong, formatMonthDay } from "@/lib/date-range/dates";
import {
  countryForCurrency,
  currencyForCountry,
  findFiscalCountry,
  listFiscalCountries,
  resolveAutoFiscalYear,
  rollFiscalYear,
  validateFiscalYear,
  type FiscalYear,
} from "@/lib/date-range/fiscal-year";
import { AppSettings, useSettings } from "@/lib/settings";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-6 first:mt-0">
      <CardHeader>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}

function Row({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
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

  const [draft, setDraft] = useState<Partial<AppSettings>>({});
  const [saved, setSaved] = useState<null | boolean>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const value: AppSettings = {
    ...settings,
    ...draft,
    notifications: {
      ...settings.notifications,
      ...draft.notifications,
    },
  };

  const edit = (patch: Partial<AppSettings>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(null);
  };

  // Country determines currency and fiscal year.
  const today = useToday();
  const countries = listFiscalCountries();

  const countryLocked = settings.countryLocked;
  const fiscalLocked = settings.fiscalYearLocked;

  const country =
    findFiscalCountry(settings.country) ?? countryForCurrency(currency);

  const auto = resolveAutoFiscalYear(
    { country: settings.country || country?.code, currency },
    today,
  );

  const baseFy: FiscalYear = settings.fiscalYearCustom ?? auto.current;

  const activeFy = settings.fiscalYearCustom
    ? rollFiscalYear(settings.fiscalYearCustom, today)
    : auto.current;

  const [pendingCountry, setPendingCountry] = useState<string | null>(null);
  const [fyEdit, setFyEdit] = useState<FiscalYear | null>(null);
  const [fyConfirm, setFyConfirm] = useState(false);

  const pending = findFiscalCountry(pendingCountry);
  const pendingCurrency = pending ? currencyForCountry(pending) : null;

  const pendingCurrencyName = currencyOptions.find(
    (c) => c.code === pendingCurrency,
  )?.name;

  const shownFy = fyEdit ?? baseFy;
  const fiscalError = fyEdit ? validateFiscalYear(fyEdit) : null;

  const fyDirty =
    !!fyEdit && (fyEdit.start !== baseFy.start || fyEdit.end !== baseFy.end);

  const editFiscal = (patch: Partial<FiscalYear>) => {
    if (fiscalLocked || Object.values(patch).some((v) => !v)) return;

    setFyEdit({
      start: shownFy.start,
      end: shownFy.end,
      ...patch,
    });
  };

  // Confirm country and automatically update its currency.
  function confirmCountry() {
    if (!pending) return;

    const newCurrency = currencyForCountry(pending);

    if (!newCurrency) return;

    // Save country and lock it.
    save({
      ...settings,
      country: pending.code,
      countryLocked: true,
    });

    // Automatically synchronize currency.
    setCurrency(newCurrency);

    setPendingCountry(null);
  }

  function confirmFiscal() {
    if (!fyEdit || fiscalError) return;

    save({
      ...settings,
      fiscalYearCustom: fyEdit,
      fiscalYearLocked: true,
    });

    setFyEdit(null);
    setFyConfirm(false);
  }

  function commit() {
    const companyName = value.companyName.trim();

    if (!companyName) {
      setNameError("Company name can't be empty.");
      return;
    }

    setNameError(null);

    const persisted = save({
      ...value,
      companyName,
    });

    setDraft({});
    setSaved(persisted);
  }

  // API settings
  const { apiSettings, save: saveApi } = useApiSettings();

  const [apiDraft, setApiDraft] = useState<Partial<ApiSettings>>({});
  const [apiSaved, setApiSaved] = useState<null | boolean>(null);

  const apiDraftValue: ApiSettings = {
    ...apiSettings,
    ...apiDraft,
  };

  const editApi = (patch: Partial<ApiSettings>) => {
    setApiDraft((d) => ({ ...d, ...patch }));
    setApiSaved(null);
  };

  function commitApi() {
    const persisted = saveApi(apiDraftValue);

    setApiDraft({});
    setApiSaved(persisted);
  }

  return (
    <AppShell
      title="Settings"
      subtitle="Manage your business and Finance AI preferences"
    >
      {/* BUSINESS SETTINGS */}
      <Section title="Business">
        <Row label="Company Name" htmlFor="company">
          <Input
            id="company"
            value={value.companyName}
            onChange={(e) => edit({ companyName: e.target.value })}
            aria-invalid={!!nameError}
          />

          {nameError && (
            <p role="alert" className="mt-1 text-xs text-negative">
              {nameError}
            </p>
          )}
        </Row>

        <Row label="Industry" htmlFor="industry">
          <Select
            id="industry"
            value={value.industry}
            onChange={(e) => edit({ industry: e.target.value })}
          >
            {industryOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row>

        {/* COUNTRY */}
        <Row label="Country" htmlFor="country">
          <Select
            id="country"
            value={country?.code ?? ""}
            disabled={countryLocked}
            onChange={(e) => {
              if (e.target.value && e.target.value !== country?.code) {
                setPendingCountry(e.target.value);
              }
            }}
          >
            {!country && <option value="">Select country...</option>}

            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>

          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
            {countryLocked && <Lock className="mt-0.5 size-3 shrink-0" />}

            {countryLocked
              ? "Country and its default currency are locked."
              : "Select your country. Currency and fiscal year will be determined automatically."}
          </p>
        </Row>
        
        {/* AUTOMATIC CURRENCY - ALWAYS LOCKED */}
        <Row label="Currency">
          <div className="flex items-center gap-2">
            <Select
              id="currency"
              value={currency}
              disabled
              aria-label="Automatically selected currency"
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </Select>

            <Lock className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </Row>


        {/* FISCAL YEAR */}
        <Row label="Fiscal Year">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">
              {formatMonthDay(activeFy.start)} – {formatMonthDay(activeFy.end)}
            </span>

            <Badge
              tone={
                fiscalLocked
                  ? "gray"
                  : settings.fiscalYearCustom
                    ? "purple"
                    : "blue"
              }
            >
              {fiscalLocked
                ? "Locked"
                : settings.fiscalYearCustom
                  ? "Custom"
                  : "Automatic"}
            </Badge>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Current period: {formatLong(activeFy.start)} –{" "}
            {formatLong(activeFy.end)}
          </p>
        </Row>

        <Row label="Start Date" htmlFor="fy-start">
          <Input
            id="fy-start"
            type="date"
            value={shownFy.start}
            disabled={fiscalLocked}
            onChange={(e) => editFiscal({ start: e.target.value })}
            aria-invalid={!!fiscalError}
          />
        </Row>

        <Row label="End Date" htmlFor="fy-end">
          <Input
            id="fy-end"
            type="date"
            value={shownFy.end}
            min={shownFy.start}
            disabled={fiscalLocked}
            onChange={(e) => editFiscal({ end: e.target.value })}
            aria-invalid={!!fiscalError}
          />

          {fiscalError && (
            <p role="alert" className="mt-1 text-xs text-negative">
              {fiscalError}
            </p>
          )}
        </Row>

        <div className="space-y-2 py-3 text-xs text-muted-foreground">
          {fiscalLocked ? (
            <p className="flex items-start gap-2">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              Locked. The fiscal year was set once and can't be changed.
            </p>
          ) : (
            <>
              {!settings.fiscalYearCustom && (
                <p className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {auto.isFallback
                    ? "No fiscal-year data was found for the selected country, so a calendar year is used."
                    : `Fiscal year is automatically determined based on your selected country${auto.country ? ` (${auto.country})` : ""}.`}
                </p>
              )}

              <p className="flex items-start gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                These dates are initially based on your selected country's
                fiscal year. You can change them if your company uses a
                different accounting period, but only one time.
              </p>

              {fyDirty && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="accent"
                    disabled={!!fiscalError}
                    onClick={() => setFyConfirm(true)}
                  >
                    Save fiscal year
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFyEdit(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      {/* COUNTRY CONFIRMATION */}
      <Modal
        open={!!pending}
        onClose={() => setPendingCountry(null)}
        title="Confirm country"
      >
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Country</dt>
            <dd className="font-medium">{pending?.name}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Currency</dt>
            <dd className="text-right font-medium">
              {pendingCurrency
                ? `${pendingCurrency}${
                    pendingCurrencyName ? ` — ${pendingCurrencyName}` : ""
                  }`
                : "Currency unavailable"}
            </dd>
          </div>
        </dl>

        <p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          This is a{" "}
          <span className="font-medium text-foreground">one-time setup</span>.
          After you confirm, the country and its default currency will be locked
          and cannot be changed again.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPendingCountry(null)}>
            Cancel
          </Button>

          <Button
            variant="accent"
            onClick={confirmCountry}
            disabled={!pendingCurrency}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      {/* FISCAL YEAR CONFIRMATION */}
      <Modal
        open={fyConfirm && !!fyEdit}
        onClose={() => setFyConfirm(false)}
        title="Confirm fiscal year"
      >
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Country</dt>
            <dd className="font-medium">{country?.name ?? "—"}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Fiscal year</dt>
            <dd className="text-right font-medium">
              {fyEdit
                ? `${formatLong(fyEdit.start)} – ${formatLong(fyEdit.end)}`
                : ""}
            </dd>
          </div>
        </dl>

        <p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          This is a{" "}
          <span className="font-medium text-foreground">one-time setup</span>.
          After you confirm, the fiscal year cannot be changed again.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFyConfirm(false)}>
            Go back
          </Button>

          <Button variant="accent" onClick={confirmFiscal}>
            Confirm
          </Button>
        </div>
      </Modal>

      {/* API CONNECTION */}
      <Section title="API Connection">
        <Row label="API URL" htmlFor="api-url">
          <Input
            id="api-url"
            placeholder="/api/transactions (or https://api.yourcompany.com/transactions)"
            value={apiDraftValue.url}
            onChange={(e) => editApi({ url: e.target.value })}
          />
        </Row>

        <Row label="Authentication" htmlFor="api-auth-scheme">
          <Select
            id="api-auth-scheme"
            value={apiDraftValue.authScheme}
            onChange={(e) =>
              editApi({
                authScheme: e.target.value as ApiSettings["authScheme"],
              })
            }
          >
            <option value="none">None</option>
            <option value="bearer">Bearer Token</option>
            <option value="header">Custom Header</option>
          </Select>
        </Row>

        {apiDraftValue.authScheme === "header" && (
          <Row label="Header Name" htmlFor="api-header-name">
            <Input
              id="api-header-name"
              placeholder="x-api-key"
              value={apiDraftValue.headerName}
              onChange={(e) => editApi({ headerName: e.target.value })}
            />
          </Row>
        )}

        {apiDraftValue.authScheme !== "none" && (
          <Row label="API Key" htmlFor="api-key">
            <Input
              id="api-key"
              type="password"
              autoComplete="off"
              placeholder={
                apiDraftValue.authScheme === "bearer"
                  ? "Sent as Authorization: Bearer <key>"
                  : "Sent as the header above"
              }
              value={apiDraftValue.apiKey}
              onChange={(e) => editApi({ apiKey: e.target.value })}
            />
          </Row>
        )}

        <div className="flex items-center justify-between py-3">
          <p className="text-xs text-muted-foreground">
            {apiDraftValue.authScheme === "none"
              ? "No authentication header will be sent."
              : apiDraftValue.authScheme === "bearer"
                ? "Sends: Authorization: Bearer <your key>"
                : `Sends: ${apiDraftValue.headerName || "x-api-key"}: <your key>`}
          </p>

          <Button size="sm" variant="outline" onClick={commitApi}>
            Save API settings
          </Button>
        </div>

        {apiSaved !== null && (
          <p
            role="status"
            className="pb-1 pt-1 text-[13px] text-muted-foreground"
          >
            {apiSaved
              ? "Saved."
              : "Applied for this session, but this browser blocked saving it."}
          </p>
        )}
      </Section>

      {/* DATA SOURCES */}
      <Section title="Data Sources">
        {dataSources.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span>{d.name}</span>
            <Badge tone={d.status === "Available" ? "green" : "gray"}>
              {d.status}
            </Badge>
          </div>
        ))}

        <div className="flex items-center justify-between py-3 text-sm">
          <span>API</span>
          <Badge tone={apiDraftValue.url ? "green" : "gray"}>
            {apiDraftValue.url ? "Configured" : "Not configured"}
          </Badge>
        </div>
      </Section>

      {/* AI SETTINGS */}
      <Section title="AI Settings">
        <Row label="Forecast Period" htmlFor="forecast">
          <Select
            id="forecast"
            value={value.forecastPeriod}
            onChange={(e) => edit({ forecastPeriod: e.target.value })}
          >
            {forecastPeriodOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row>

        <Row label="AI Response" htmlFor="response">
          <Select
            id="response"
            value={value.responseStyle}
            onChange={(e) => edit({ responseStyle: e.target.value })}
          >
            {responseStyleOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row>
      </Section>

      {/* NOTIFICATIONS */}
      <Section title="Notifications">
        {notificationOptions.map((n) => (
          <label
            key={n.id}
            className="flex cursor-pointer items-center gap-3 py-3 text-sm"
          >
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={value.notifications[n.id] ?? false}
              onChange={(e) =>
                edit({
                  notifications: {
                    ...value.notifications,
                    [n.id]: e.target.checked,
                  },
                })
              }
            />
            {n.label}
          </label>
        ))}
      </Section>

      {/* SECURITY */}
      <Section title="Security">
        {securityItems.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className="text-muted-foreground">{s.label}</span>
            <span>{s.value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between py-3 text-sm">
          <span className="text-muted-foreground">Password</span>

          <Link
            href="/forgot-password"
            className="font-medium text-accent hover:underline"
          >
            Change password
          </Link>
        </div>
      </Section>

      {/* SAVE SETTINGS */}
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
