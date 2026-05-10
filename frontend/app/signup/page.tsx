"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { ErrorBlock } from "@/components/StateBlock";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    setError(null);
    try {
      await signup({
        email: String(formData.get("email") ?? ""),
        full_name: String(formData.get("full_name") ?? ""),
        phone: stringOrNull(formData.get("phone")),
        password: String(formData.get("password") ?? ""),
        role: String(formData.get("role")) as UserRole,
      });
      router.push("/");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Local MVP signup with simple role selection.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error ? <ErrorBlock message={error} /> : null}
          <Field label="Full name" name="full_name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" />
          <Field label="Password" name="password" type="password" required />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Role</span>
            <select
              name="role"
              defaultValue="seller"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
              <option value="verified_agent">Verified agent</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Signup"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  const stringValue = String(value ?? "").trim();
  return stringValue ? stringValue : null;
}
