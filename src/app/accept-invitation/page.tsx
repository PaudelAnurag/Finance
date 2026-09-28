"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { invitation, minPasswordLength } from "@/data/mock-auth";
import { useSettings } from "@/lib/settings";

export default function AcceptInvitationPage() {
  const { settings } = useSettings();
  const [name, setName] = useState(invitation.name);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ name?: string; password?: string; confirm?: string }>({});
  const [accepted, setAccepted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (password.length < minPasswordLength) next.password = `Use at least ${minPasswordLength} characters.`;
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setAccepted(true); // Mock: no account is created in Phase 1.
  }

  return (
    <AuthShell
      title="You've been invited"
      subtitle={`${settings.companyName} has invited you to join their workspace.`}
    >
      {accepted ? (
        <div role="status" className="space-y-4 text-center text-sm">
          <p className="font-medium">Invitation accepted</p>
          <p className="text-muted-foreground">Mock only — no account was created in Phase 1.</p>
          <Link href="/login" className={buttonVariants({ variant: "accent" }) + " w-full"}>
            Go to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Name" error={errors.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email" hint="Set by your invitation.">
            <Input type="email" value={invitation.email} readOnly />
          </Field>
          <Field label="Create Password" error={errors.password}>
            <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="Confirm Password" error={errors.confirm}>
            <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </Field>
          <Button type="submit" variant="accent" className="w-full">
            Accept Invitation
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
