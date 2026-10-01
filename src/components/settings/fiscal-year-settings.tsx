"use client";

import { Info, Lock } from "lucide-react";
import { useState } from "react";

import { Row } from "@/components/settings/settings-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useCurrency } from "@/lib/currency";
import { useToday } from "@/lib/date-range/context";
import { formatLong, formatMonthDay } from "@/lib/date-range/dates";
import {
  resolveAutoFiscalYear,
  rollFiscalYear,
  validateFiscalYear,
  type FiscalCountry,
  type FiscalYear,
} from "@/lib/date-range/fiscal-year";
import { useSettings } from "@/lib/settings";

/** The company's fiscal year: automatic from the country, or custom — set once, then locked. */
export function useFiscalYearSetting(country: FiscalCountry | null) {
  const { currency } = useCurrency();
  const { settings, save } = useSettings();
  const today = useToday();
  const [fyEdit, setFyEdit] = useState<FiscalYear | null>(null);
  const [confirming, setConfirming] = useState(false);

  const locked = settings.fiscalYearLocked;
  const auto = resolveAutoFiscalYear({ country: settings.country || country?.code, currency }, today);
  const baseFy: FiscalYear = settings.fiscalYearCustom ?? auto.current;
  const activeFy = settings.fiscalYearCustom ? rollFiscalYear(settings.fiscalYearCustom, today) : auto.current;
  const shownFy = fyEdit ?? baseFy;
  const error = fyEdit ? validateFiscalYear(fyEdit) : null;
  const dirty = !!fyEdit && (fyEdit.start !== baseFy.start || fyEdit.end !== baseFy.end);

  function edit(patch: Partial<FiscalYear>) {
    if (locked || Object.values(patch).some((v) => !v)) return;
    setFyEdit({ start: shownFy.start, end: shownFy.end, ...patch });
  }

  function confirm() {
    if (!fyEdit || error) return;
    save({ ...settings, fiscalYearCustom: fyEdit, fiscalYearLocked: true });
    setFyEdit(null);
    setConfirming(false);
  }

  return {
    country,
    auto,
    activeFy,
    shownFy,
    fyEdit,
    custom: settings.fiscalYearCustom,
    locked,
    error,
    dirty,
    confirming,
    edit,
    discard: () => setFyEdit(null),
    askConfirm: () => setConfirming(true),
    cancelConfirm: () => setConfirming(false),
    confirm,
  };
}
export type FiscalYearSetting = ReturnType<typeof useFiscalYearSetting>;

export function FiscalYearRows({ s }: { s: FiscalYearSetting }) {
  return (
    <>
      <Row label="Fiscal Year">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">
            {formatMonthDay(s.activeFy.start)} – {formatMonthDay(s.activeFy.end)}
          </span>
          <Badge tone={s.locked ? "gray" : s.custom ? "purple" : "blue"}>
            {s.locked ? "Locked" : s.custom ? "Custom" : "Automatic"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Current period: {formatLong(s.activeFy.start)} – {formatLong(s.activeFy.end)}
        </p>
      </Row>

      <Row label="Start Date" htmlFor="fy-start">
        <Input
          id="fy-start"
          type="date"
          value={s.shownFy.start}
          disabled={s.locked}
          onChange={(e) => s.edit({ start: e.target.value })}
          aria-invalid={!!s.error}
        />
      </Row>

      <Row label="End Date" htmlFor="fy-end">
        <Input
          id="fy-end"
          type="date"
          value={s.shownFy.end}
          min={s.shownFy.start}
          disabled={s.locked}
          onChange={(e) => s.edit({ end: e.target.value })}
          aria-invalid={!!s.error}
        />
        {s.error && (
          <p role="alert" className="mt-1 text-xs text-negative">
            {s.error}
          </p>
        )}
      </Row>

      <div className="space-y-2 py-3 text-xs text-muted-foreground">
        {s.locked ? (
          <p className="flex items-start gap-2">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            Locked. The fiscal year was set once and can&apos;t be changed.
          </p>
        ) : (
          <>
            {!s.custom && (
              <p className="flex items-start gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {s.auto.isFallback
                  ? "No fiscal-year data was found for the selected country, so a calendar year is used."
                  : `Fiscal year is automatically determined based on your selected country${s.auto.country ? ` (${s.auto.country})` : ""}.`}
              </p>
            )}
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              These dates are initially based on your selected country&apos;s fiscal year. You can change them if your company
              uses a different accounting period, but only one time.
            </p>
            {s.dirty && (
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="accent" disabled={!!s.error} onClick={s.askConfirm}>
                  Save fiscal year
                </Button>
                <Button size="sm" variant="outline" onClick={s.discard}>
                  Cancel
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export function FiscalYearConfirmModal({ s }: { s: FiscalYearSetting }) {
  return (
    <Modal open={s.confirming && !!s.fyEdit} onClose={s.cancelConfirm} title="Confirm fiscal year">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Country</dt>
          <dd className="font-medium">{s.country?.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Fiscal year</dt>
          <dd className="text-right font-medium">{s.fyEdit ? `${formatLong(s.fyEdit.start)} - ${formatLong(s.fyEdit.end)}` : ""}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
        This is a <span className="font-medium text-foreground">one-time setup</span>. After you confirm, the fiscal year cannot
        be changed again.
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={s.cancelConfirm}>
          Go back
        </Button>
        <Button variant="accent" onClick={s.confirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
