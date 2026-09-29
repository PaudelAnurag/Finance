"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  transactionCategories,
  transactionStatuses,
  transactionTypes,
} from "@/data/mock-transactions";

function AddTransactionForm({
  defaultDate,
  onCancel,
  onAdd,
}: {
  defaultDate: string;
  onCancel: () => void;
  onAdd: (t: Omit<Transaction, "id">) => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(transactionCategories[0]);
  const [type, setType] = useState<TransactionType>("Expense");
  const [status, setStatus] = useState<TransactionStatus>("Completed");
  const [date, setDate] = useState(defaultDate);
  const [errors, setErrors] = useState<{ description?: string; amount?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    const next: typeof errors = {};
    if (!description.trim()) next.description = "Enter a description.";
    if (!Number.isFinite(value) || value <= 0) next.amount = "Enter an amount greater than 0.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onAdd({ description: description.trim(), amount: value, category, type, status, date });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Description" error={errors.description}>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Office supplies" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount" error={errors.amount}>
          <Input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
            {transactionTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as TransactionStatus)}>
            {transactionStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Category">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {transactionCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      {/* <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent">
          Add Transaction
        </Button>
      </div> */}
    </form>
  );
}

// export function AddTransactionModal({
//   open,
//   defaultDate,
//   onClose,
//   onAdd,
// }: {
//   open: boolean;
//   defaultDate: string;
//   onClose: () => void;
//   onAdd: (t: Omit<Transaction, "id">) => void;
// }) {
//   return (
//     <Modal open={open} onClose={onClose} title="Add Transaction">
//       <AddTransactionForm defaultDate={defaultDate} onCancel={onClose} onAdd={onAdd} />
//     </Modal>
//   );
// }
