"use client";

import { useState } from "react";

import { Row } from "@/components/settings/settings-layout";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { currencyOptions, useCurrency } from "@/lib/currency";
import { countryForCurrency, currencyForCountry, findFiscalCountry, listFiscalCountries } from "@/lib/date-range/fiscal-year";
import { useSettings } from "@/lib/settings";

/** Country drives currency and fiscal year. Picking one is a confirmed, one-time (locking) action. */
export function useCountrySetting() {
  const { currency, setCurrency } = useCurrency();
  const { settings, save } = useSettings();
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);

  const country = findFiscalCountry(settings.country) ?? countryForCurrency(currency);
  const pending = findFiscalCountry(pendingCountry);
  const pendingCurrency = pending ? currencyForCountry(pending) : null;
  const pendingCurrencyName = currencyOptions.find((c) => c.code === pendingCurrency)?.name;

  function confirm() {
    if (!pending || !pendingCurrency) return;
    save({ ...settings, country: pending.code, countryLocked: true });
    setCurrency(pendingCurrency); // keep currency in step with the country
    setPendingCountry(null);
  }

  return {
    country,
    countries: listFiscalCountries(),
    currency,
    locked: settings.countryLocked,
    pending,
    pendingCurrency,
    pendingCurrencyName,
    request: setPendingCountry,
    cancel: () => setPendingCountry(null),
    confirm,
  };
}
export type CountrySetting = ReturnType<typeof useCountrySetting>;

export function CountryRows({ s }: { s: CountrySetting }) {
  return (
    <>
      <Row label="Country" htmlFor="country">
        <Select
          id="country"
          value={s.country?.code ?? ""}
          disabled={s.locked}
          onChange={(e) => {
            if (e.target.value && e.target.value !== s.country?.code) s.request(e.target.value);
          }}
        >
          {!s.country && <option value="">Select country...</option>}
          {s.countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>
      </Row>

      {/* Currency follows the country automatically, so it is always read-only. */}
      <Row label="Currency">
        <div className="flex items-center gap-2">
          <Select id="currency" value={s.currency} disabled aria-label="Automatically selected currency">
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </Select>
        </div>
      </Row>
    </>
  );
}

export function CountryConfirmModal({ s }: { s: CountrySetting }) {
  return (
    <Modal open={!!s.pending} onClose={s.cancel} title="Confirm country">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Country</dt>
          <dd className="font-medium">{s.pending?.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Currency</dt>
          <dd className="text-right font-medium">
            {s.pendingCurrency
              ? `${s.pendingCurrency}${s.pendingCurrencyName ? ` — ${s.pendingCurrencyName}` : ""}`
              : "Currency unavailable"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
        This is a <span className="font-medium text-foreground">one-time setup</span>. After you confirm, the country and its
        default currency will be locked and cannot be changed again.
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={s.cancel}>
          Cancel
        </Button>
        <Button variant="accent" onClick={s.confirm} disabled={!s.pendingCurrency}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
