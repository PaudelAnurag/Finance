"use client";

import { CountryConfirmModal, CountryRows, useCountrySetting } from "@/components/settings/country-settings";
import { FiscalYearConfirmModal, FiscalYearRows, useFiscalYearSetting } from "@/components/settings/fiscal-year-settings";
import { Row, Section } from "@/components/settings/settings-layout";
import { Input, Select } from "@/components/ui/field";
import { industryOptions } from "@/data/mock-settings";
import type { AppSettings } from "@/lib/settings";

export function BusinessSection({
  value,
  nameError,
  onChange,
}: {
  value: AppSettings;
  nameError: string | null;
  onChange: (patch: Partial<AppSettings>) => void;
}) {
  const country = useCountrySetting();
  const fiscalYear = useFiscalYearSetting(country.country);

  return (
    <>
      <Section title="Business">
        <Row label="Company Name" htmlFor="company">
          <Input
            id="company"
            value={value.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            aria-invalid={!!nameError}
          />
          {nameError && (
            <p role="alert" className="mt-1 text-xs text-negative">
              {nameError}
            </p>
          )}
        </Row>

        <Row label="Industry" htmlFor="industry">
          <Select id="industry" value={value.industry} onChange={(e) => onChange({ industry: e.target.value })}>
            {industryOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Row>

        <CountryRows s={country} />
        <FiscalYearRows s={fiscalYear} />
      </Section>

      {/* Modals sit outside the Section so its divide-y never styles the overlay. */}
      <CountryConfirmModal s={country} />
      <FiscalYearConfirmModal s={fiscalYear} />
    </>
  );
}
