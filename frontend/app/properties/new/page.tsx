"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBlock } from "@/components/StateBlock";
import {
  Button,
  Card,
  FieldShell,
  inputStyles,
  SectionHeader,
} from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ListingType, PropertyCreatePayload, PropertyType } from "@/lib/types";

export default function CreatePropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sampleOwnerId, setSampleOwnerId] = useState("");

  useEffect(() => {
    async function loadSampleOwner() {
      try {
        if (user) {
          setSampleOwnerId(user.id);
          return;
        }
        const properties = await api.listProperties();
        setSampleOwnerId(properties[0]?.owner_id ?? "");
      } catch {
        setSampleOwnerId("");
      }
    }

    void loadSampleOwner();
  }, [user]);

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
      <AuthGuard roles={["admin", "seller"]}>
        <SectionHeader
          eyebrow="Seller workspace"
          title="Create property listing"
          description="Add AP land record, listing, and geospatial fields for a verified transaction workflow."
        />

        <form onSubmit={handleSubmit} className="mt-6 grid max-w-5xl gap-5">
          <Card className="grid gap-5 p-5">
            {error ? <ErrorBlock message={error} /> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Owner UUID"
                name="owner_id"
                required
                defaultValue={sampleOwnerId}
              />
              <Field label="Title" name="title" required />
              <FieldShell label="Listing type">
                <select
                  name="listing_type"
                  className={inputStyles}
                  defaultValue="sale"
                >
                  <option value="sale">Sale</option>
                  <option value="lease">Lease</option>
                  <option value="sale_or_lease">Sale or lease</option>
                </select>
              </FieldShell>
              <FieldShell label="Property type">
                <select
                  name="property_type"
                  className={inputStyles}
                  defaultValue="land"
                >
                  <option value="land">Land</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                </select>
              </FieldShell>
            </div>

            <FieldShell label="Description">
              <textarea name="description" rows={4} className={inputStyles} />
            </FieldShell>

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

            <Button type="submit" disabled={isSaving} className="w-fit">
              {isSaving ? "Creating..." : "Create listing"}
            </Button>
          </Card>
        </form>
      </AuthGuard>
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
    <FieldShell label={label}>
      <input
        key={defaultValue}
        name={name}
        type={type}
        required={required}
        step={step}
        defaultValue={defaultValue}
        className={inputStyles}
      />
    </FieldShell>
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
