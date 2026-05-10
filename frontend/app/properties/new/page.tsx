"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { ErrorBlock } from "@/components/StateBlock";
import { api } from "@/lib/api";
import type { ListingType, PropertyCreatePayload, PropertyType } from "@/lib/types";

const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sampleOwnerId, setSampleOwnerId] = useState("");

  useEffect(() => {
    async function loadSampleOwner() {
      try {
        const properties = await api.listProperties();
        setSampleOwnerId(properties[0]?.owner_id ?? "");
      } catch {
        setSampleOwnerId("");
      }
    }

    void loadSampleOwner();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const latitude = numberOrNull(formData.get("latitude"));
    const longitude = numberOrNull(formData.get("longitude"));
    const extent = numberOrNull(formData.get("extent_sq_yards"));

    const payload: PropertyCreatePayload = {
      owner_id: String(formData.get("owner_id") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: stringOrNull(formData.get("description")),
      property_type: String(formData.get("property_type")) as PropertyType,
      listing_type: String(formData.get("listing_type")) as ListingType,
      address_line: stringOrNull(formData.get("address_line")),
      village: stringOrNull(formData.get("village")),
      mandal: stringOrNull(formData.get("mandal")),
      district: stringOrNull(formData.get("district")),
      state: "Andhra Pradesh",
      survey_number: stringOrNull(formData.get("survey_number")),
      latitude,
      longitude,
      extent_sq_yards: extent,
      listing_status: "draft",
      verification_status: "pending",
      is_verified: false,
    };

    setIsSaving(true);
    setError(null);
    try {
      const created = await api.createProperty(payload);
      router.push(`/properties/${created.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Create failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-semibold">Create property listing</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add a local MVP listing with AP land record fields. Authentication is
          intentionally not part of this demo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid max-w-5xl gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        {error ? <ErrorBlock message={error} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Owner UUID"
            name="owner_id"
            required
            defaultValue={sampleOwnerId}
          />
          <Field label="Title" name="title" required />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Listing type</span>
            <select name="listing_type" className={inputClass} defaultValue="sale">
              <option value="sale">Sale</option>
              <option value="lease">Lease</option>
              <option value="sale_or_lease">Sale or lease</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Property type</span>
            <select name="property_type" className={inputClass} defaultValue="land">
              <option value="land">Land</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>
        </div>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Description</span>
          <textarea name="description" rows={4} className={inputClass} />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="District" name="district" />
          <Field label="Mandal" name="mandal" />
          <Field label="Village" name="village" />
          <Field label="Survey number" name="survey_number" />
          <Field label="Extent sq yd" name="extent_sq_yards" type="number" />
          <Field label="Address line" name="address_line" />
          <Field label="Latitude" name="latitude" type="number" step="any" />
          <Field label="Longitude" name="longitude" type="number" step="any" />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-fit rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Creating..." : "Create listing"}
        </button>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        key={defaultValue}
        name={name}
        type={type}
        required={required}
        step={step}
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

function numberOrNull(value: FormDataEntryValue | null): number | null {
  const stringValue = String(value ?? "").trim();
  return stringValue ? Number(stringValue) : null;
}
