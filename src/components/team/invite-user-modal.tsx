"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { UserRole, userRoles } from "@/data/mock-team";
import { emailPattern } from "@/lib/team";

export interface InviteInput {
  name: string;
  email: string;
  role: UserRole;
}

function InviteForm({
  existingEmails,
  onCancel,
  onInvite,
}: {
  existingEmails: string[];
  onCancel: () => void;
  onInvite: (input: InviteInput) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Viewer");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    const normalized = email.trim().toLowerCase();
    if (!name.trim()) next.name = "Enter a name.";
    if (!emailPattern.test(normalized)) next.email = "Enter a valid email address.";
    else if (existingEmails.includes(normalized)) next.email = "This email is already on the team.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onInvite({ name: name.trim(), email: normalized, role });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Name" error={errors.name}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mike Brown" />
      </Field>
      <Field label="Email" error={errors.email}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mike@acme.com" />
      </Field>
      <Field label="Role">
        <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          {userRoles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent">
          Send Invitation
        </Button>
      </div>
    </form>
  );
}

export function InviteUserModal({
  open,
  existingEmails,
  onClose,
  onInvite,
}: {
  open: boolean;
  existingEmails: string[];
  onClose: () => void;
  onInvite: (input: InviteInput) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Invite User">
      <InviteForm existingEmails={existingEmails} onCancel={onClose} onInvite={onInvite} />
    </Modal>
  );
}
