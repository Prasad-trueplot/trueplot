"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { ErrorBlock } from "@/components/StateBlock";
import { Button, Card, FieldShell, inputStyles } from "@/components/ui";
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
      <Card className="mx-auto max-w-lg p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          TRUEPLOT access
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Local MVP signup with simple role selection.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error ? <ErrorBlock message={error} /> : null}
          <Field label="Full name" name="full_name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" />
          <Field label="Password" name="password" type="password" required />
          <FieldShell label="Role">
            <select
              name="role"
              defaultValue="seller"
              className={inputStyles}
            >
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
              <option value="verified_agent">Verified agent</option>
            </select>
          </FieldShell>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating..." : "Signup"}
          </Button>
        </form>
      </Card>
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
    <FieldShell label={label}>
      <input
        name={name}
        type={type}
        required={required}
        className={inputStyles}
      />
    </FieldShell>
  );
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  const stringValue = String(value ?? "").trim();
  return stringValue ? stringValue : null;
}
