"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { ErrorBlock } from "@/components/StateBlock";
import { Button, Card, FieldShell, inputStyles } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    setError(null);
    try {
      await login(
        String(formData.get("email") ?? ""),
        String(formData.get("password") ?? ""),
      );
      router.push("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <Card className="mx-auto max-w-md p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Secure workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Demo users use password <span className="font-semibold">trueplot123</span>.
        </p>
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-6 text-slate-600">
          Admin: admin@trueplot.local
          <br />
          Seller: owner@example.com
          <br />
          Agent: agent@example.com
          <br />
          Buyer: buyer@example.com
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error ? <ErrorBlock message={error} /> : null}
          <FieldShell label="Email">
            <input
              name="email"
              type="email"
              required
              defaultValue="admin@trueplot.local"
              className={inputStyles}
            />
          </FieldShell>
          <FieldShell label="Password">
            <input
              name="password"
              type="password"
              required
              defaultValue="trueplot123"
              className={inputStyles}
            />
          </FieldShell>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-emerald-900">
            Create one
          </Link>
        </p>
      </Card>
    </AppShell>
  );
}
