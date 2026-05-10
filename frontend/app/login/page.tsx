"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { ErrorBlock } from "@/components/StateBlock";
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
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Demo users use password <span className="font-semibold">trueplot123</span>.
        </p>
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
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
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue="admin@trueplot.local"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              defaultValue="trueplot123"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-emerald-900">
            Create one
          </Link>
        </p>
      </section>
    </AppShell>
  );
}

