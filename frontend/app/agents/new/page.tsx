"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBlock } from "@/components/StateBlock";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AgentCreatePayload } from "@/lib/types";

const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

export default function NewAgentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sampleUserId, setSampleUserId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSampleUser() {
      try {
        if (user) {
          setSampleUserId(user.id);
          return;
        }
        const properties = await api.listProperties();
        setSampleUserId(properties[0]?.owner_id ?? "");
      } catch {
        setSampleUserId("");
      }
    }

    void loadSampleUser();
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: AgentCreatePayload = {
      user_id: String(formData.get("user_id") ?? ""),
      license_number: stringOrNull(formData.get("license_number")),
      agency_name: stringOrNull(formData.get("agency_name")),
      service_area: stringOrNull(formData.get("service_area")),
      district_specialization: stringOrNull(formData.get("district_specialization")),
      mandal_specialization: stringOrNull(formData.get("mandal_specialization")),
      village_specialization: stringOrNull(formData.get("village_specialization")),
      supports_leasing: formData.get("supports_leasing") === "on",
      supports_nri: formData.get("supports_nri") === "on",
      is_verified: false,
    };

    setIsSaving(true);
    setError(null);
    try {
      const created = await api.createAgent(payload);
      router.push(`/agents/${created.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Create failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <AuthGuard roles={["admin", "verified_agent"]}>
        <h1 className="text-3xl font-semibold">Agent onboarding</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create a local MVP agent profile for admin verification. KYC provider
          integration is intentionally not included.
        </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid max-w-5xl gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        {error ? <ErrorBlock message={error} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="User UUID" name="user_id" required defaultValue={sampleUserId} />
          <Field label="License number" name="license_number" />
          <Field label="Agency name" name="agency_name" />
          <Field label="Service area" name="service_area" />
          <Field label="District specialization" name="district_specialization" />
          <Field label="Mandal specialization" name="mandal_specialization" />
          <Field label="Village specialization" name="village_specialization" />
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="supports_leasing" />
            Leasing specialist
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="supports_nri" />
            NRI specialist
          </label>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-fit rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Creating..." : "Create agent"}
        </button>
        </form>
      </AuthGuard>
    </AppShell>
  );
}

function Field({
  label,
  name,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        key={defaultValue}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </label>
  );
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  const stringValue = String(value ?? "").trim();
  return stringValue ? stringValue : null;
}
