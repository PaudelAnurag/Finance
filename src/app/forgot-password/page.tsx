"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { demoLogin } from "@/data/mock-auth";
import { emailPattern } from "@/lib/team";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(demoLogin.email);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid work email.");
      return;
    }
    setError(null);
    setSent(true); // Mock: no email is sent in Phase 1.
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your work email to reset it."
      footer={
        <Link href="/login" className="font-medium text-accent hover:underline">
          ← Back to Login
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="space-y-2 text-center text-sm">
          <p className="font-medium">Check your inbox</p>
          <p className="text-muted-foreground">
            If an account exists for {email.trim()}, a reset link would be sent. (Mock — no email is sent in Phase 1.)
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Work Email" error={error ?? undefined}>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" variant="accent" className="w-full">
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
