"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { demoLogin } from "@/data/mock-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(demoLogin.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    // Mock sign-in: real authentication comes with the backend.
    router.push("/");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account"
      footer="Don't have access? Contact your administrator."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Password</span>
            <Link href="/forgot-password" className="text-[13px] text-accent hover:underline">
              Forgot?
            </Link>
          </div>
          <Input
            type="password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-negative">
            {error}
          </p>
        )}
        <Button type="submit" variant="accent" className="w-full">
          Sign In
        </Button>
        <p className="text-center text-xs text-muted-foreground">Mock sign-in — no real authentication yet.</p>
      </form>
    </AuthShell>
  );
}
