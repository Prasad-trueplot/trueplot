"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AISummaryPanel } from "@/components/AISummaryPanel";
import { AgentAssignmentPanel } from "@/components/AgentAssignmentPanel";
import { AppShell } from "@/components/AppShell";
import { DocumentPanel } from "@/components/DocumentPanel";
import { PropertyActions } from "@/components/PropertyActions";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { formatDate, formatExtent, titleCase } from "@/lib/format";
import type { AISummary, PropertyDocument, PropertyRecord } from "@/lib/types";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params.id;
  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPropertyWorkspace() {
      setIsLoading(true);
      setError(null);
      try {
        const [propertyResponse, documentResponse, summaryResponse] =
          await Promise.all([
            api.getProperty(propertyId),
            api.listDocuments(propertyId),
            api.listSummaries(propertyId),
          ]);
        setProperty(propertyResponse);
        setDocuments(documentResponse);
        setSummaries(summaryResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPropertyWorkspace();
  }, [propertyId]);

  async function generateSummary(documentId: string) {
    const summary = await api.generateSummary(documentId);
    setSummaries((current) => [summary, ...current]);
  }

  if (isLoading) {
    return (
      <AppShell>
        <LoadingBlock label="Loading property workspace" />
      </AppShell>
    );
  }

  if (error || !property) {
    return (
      <AppShell>
        <ErrorBlock message={error ?? "Property not found"} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/properties" className="text-sm font-semibold text-emerald-900">
          Back to listings
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={property.listing_status} />
              <StatusBadge value={property.verification_status} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {titleCase(property.listing_type)}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold">{property.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {property.description ?? "No description provided."}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Owner UUID</p>
            <p className="mt-1 break-all font-medium">{property.owner_id}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Detail label="District" value={property.district} />
          <Detail label="Mandal" value={property.mandal} />
          <Detail label="Village" value={property.village} />
          <Detail label="Survey number" value={property.survey_number} />
          <Detail label="Property type" value={titleCase(property.property_type)} />
          <Detail label="Extent" value={formatExtent(property.extent_sq_yards)} />
          <Detail
            label="Coordinates"
            value={
              property.latitude && property.longitude
                ? `${property.latitude}, ${property.longitude}`
                : "Not set"
            }
          />
          <Detail label="Updated" value={formatDate(property.updated_at)} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <DocumentPanel
            propertyId={property.id}
            documents={documents}
            onDocumentsChange={setDocuments}
            onGenerateSummary={generateSummary}
          />
          <AISummaryPanel summaries={summaries} />
        </div>
        <div className="space-y-6">
          <AgentAssignmentPanel property={property} onChange={setProperty} />
          <PropertyActions property={property} onChange={setProperty} />
        </div>
      </div>
    </AppShell>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value ?? "Not set"}</p>
    </div>
  );
}
