"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AISummaryPanel } from "@/components/AISummaryPanel";
import { AgentAssignmentPanel } from "@/components/AgentAssignmentPanel";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { DocumentPanel } from "@/components/DocumentPanel";
import { PropertyActions } from "@/components/PropertyActions";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { ButtonLink, Card, DetailTile, MapPreview } from "@/components/ui";
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
        <Link href="/properties" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
          Back to listings
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={property.listing_status} />
              <StatusBadge value={property.verification_status} />
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                {titleCase(property.listing_type)}
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal text-slate-950">
              {property.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {property.description ?? "No description provided."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/admin" variant="secondary">
                Moderation console
              </ButtonLink>
              <ButtonLink href="/properties" variant="ghost">
                Browse listings
              </ButtonLink>
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-4 lg:border-l lg:border-t-0">
            <MapPreview
              label={
                property.survey_number
                  ? `Survey ${property.survey_number}`
                  : "Property geospatial view"
              }
            />
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Owner UUID
              </p>
              <p className="mt-2 break-all font-semibold text-slate-950">
                {property.owner_id}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <DetailTile label="District" value={property.district ?? "Not set"} />
        <DetailTile label="Mandal" value={property.mandal ?? "Not set"} />
        <DetailTile label="Village" value={property.village ?? "Not set"} />
        <DetailTile label="Survey number" value={property.survey_number ?? "Not set"} />
        <DetailTile label="Property type" value={titleCase(property.property_type)} />
        <DetailTile label="Extent" value={formatExtent(property.extent_sq_yards)} />
        <DetailTile
          label="Coordinates"
          value={
            property.latitude && property.longitude
              ? `${property.latitude}, ${property.longitude}`
              : "Not set"
          }
        />
        <DetailTile label="Updated" value={formatDate(property.updated_at)} />
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
          <AuthGuard roles={["admin"]}>
            <AgentAssignmentPanel property={property} onChange={setProperty} />
            <PropertyActions property={property} onChange={setProperty} />
          </AuthGuard>
        </div>
      </div>
    </AppShell>
  );
}
