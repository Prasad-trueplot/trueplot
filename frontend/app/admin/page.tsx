"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Button,
  ButtonLink,
  Card,
  MetricCard,
  SectionHeader,
} from "@/components/ui";
import { api } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type {
  Agent,
  PropertyDocument,
  PropertyRecord,
} from "@/lib/types";

type DocumentSummary = {
  propertyId: string;
  title: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export default function AdminPage() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [documentSummary, setDocumentSummary] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      setError(null);
      try {
        const [propertyResponse, agentResponse] = await Promise.all([
          api.listProperties(),
          api.listAgents(),
        ]);
        setProperties(propertyResponse);
        setAgents(agentResponse);

        const documentResponses = await Promise.all(
          propertyResponse.map(async (property) => ({
            property,
            documents: await api.listDocuments(property.id),
          })),
        );
        setDocumentSummary(
          documentResponses.map(({ property, documents }) =>
            summarizeDocuments(property, documents),
          ),
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAdminData();
  }, []);

  const queue = useMemo(
    () =>
      properties.filter(
        (property) =>
          property.listing_status !== "active" || !property.is_verified,
      ),
    [properties],
  );

  const agentQueue = useMemo(
    () => agents.filter((agent) => !agent.is_verified),
    [agents],
  );

  const documentsPending = documentSummary.reduce((sum, item) => sum + item.pending, 0);
  const documentsTotal = documentSummary.reduce((sum, item) => sum + item.total, 0);

  async function updateProperty(
    propertyId: string,
    action: () => Promise<PropertyRecord>,
  ) {
    setBusyId(propertyId);
    setError(null);
    try {
      const updated = await action();
      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId ? updated : property,
        ),
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Action failed",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function approveAgent(agentId: string) {
    setBusyId(agentId);
    setError(null);
    try {
      const updated = await api.updateAgentVerification(agentId, true);
      setAgents((current) =>
        current.map((agent) => (agent.id === agentId ? updated : agent)),
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Action failed",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell>
      <AuthGuard roles={["admin"]}>
        <SectionHeader
          eyebrow="Trust operations"
          title="Admin moderation"
          description="Approve listings, verify property records, certify agents, and track document review from one operating console."
        />

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Listings" value={properties.length} detail="Total inventory" />
          <MetricCard label="Review queue" value={queue.length} detail="Needs action" />
          <MetricCard label="Agents" value={agents.length} detail="Onboarding records" />
          <MetricCard label="Pending agents" value={agentQueue.length} detail="Awaiting approval" />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Documents" value={documentsTotal} detail="Uploaded records" />
          <MetricCard label="Docs pending" value={documentsPending} detail="Need review" />
          <MetricCard label="Verified listings" value={properties.filter((property) => property.is_verified).length} detail="Trust marked" />
          <MetricCard label="Active listings" value={properties.filter((property) => property.listing_status === "active").length} detail="Marketplace ready" />
        </section>

        {isLoading ? (
          <div className="mt-6">
            <LoadingBlock label="Loading moderation workspace" />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorBlock message={error} />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <ModerationSection
                title="Listing review queue"
                subtitle={`${queue.length} listings need approval or verification.`}
              >
                {queue.length === 0 ? (
                  <p className="p-6 text-sm text-slate-600">No listings need moderation.</p>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {queue.map((property) => (
                      <div
                        key={property.id}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div>
                          <Link
                            href={`/properties/${property.id}`}
                            className="text-base font-semibold text-slate-950 hover:text-emerald-700"
                          >
                            {property.title}
                          </Link>
                          <p className="mt-1 text-sm text-slate-600">
                            {[property.village, property.mandal, property.district]
                              .filter(Boolean)
                              .join(", ") || "Location not set"}{" "}
                            · {titleCase(property.listing_type)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge value={property.listing_status} />
                            <StatusBadge value={property.verification_status} />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          <Button
                            onClick={() =>
                              updateProperty(property.id, () =>
                                api.updatePropertyStatus(property.id, "active"),
                              )
                            }
                            disabled={busyId === property.id}
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() =>
                              updateProperty(property.id, () =>
                                api.updatePropertyVerification(
                                  property.id,
                                  true,
                                  "verified",
                                ),
                              )
                            }
                            disabled={busyId === property.id}
                            variant="secondary"
                          >
                            Verify
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ModerationSection>

              <ModerationSection
                title="Document review summary"
                subtitle="Upload coverage and review status by property."
              >
                {documentSummary.length === 0 ? (
                  <p className="p-6 text-sm text-slate-600">No documents uploaded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {documentSummary.map((summary) => (
                      <div
                        key={summary.propertyId}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div>
                          <Link
                            href={`/properties/${summary.propertyId}`}
                            className="text-sm font-semibold text-slate-950 hover:text-emerald-700"
                          >
                            {summary.title}
                          </Link>
                          <p className="mt-1 text-sm text-slate-600">
                            {summary.total} documents · {summary.pending} pending · {summary.approved} approved · {summary.rejected} rejected
                          </p>
                        </div>
                        <StatusBadge value={summary.pending > 0 ? "pending" : "verified"} />
                      </div>
                    ))}
                  </div>
                )}
              </ModerationSection>
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/80 p-5">
                  <h2 className="text-lg font-semibold text-slate-950">Agent approval queue</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {agentQueue.length} agents need verification.
                  </p>
                </div>
                {agentQueue.length === 0 ? (
                  <p className="p-6 text-sm text-slate-600">No agents need approval.</p>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {agentQueue.map((agent) => (
                      <div
                        key={agent.id}
                        className="grid gap-4 p-4"
                      >
                        <div>
                          <Link
                            href={`/agents/${agent.id}`}
                            className="text-sm font-semibold text-slate-950 hover:text-emerald-700"
                          >
                            {agent.agency_name ?? "Independent agent"}
                          </Link>
                          <p className="mt-1 text-sm text-slate-600">
                            {agent.district_specialization ?? "District not set"} ·{" "}
                            {agent.supports_leasing ? "Leasing" : "Sale"} ·{" "}
                            {agent.supports_nri ? "NRI supported" : "Local clients"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => approveAgent(agent.id)}
                            disabled={busyId === agent.id}
                          >
                            Approve agent
                          </Button>
                          <ButtonLink href={`/agents/${agent.id}`} variant="secondary">
                            View
                          </ButtonLink>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </AuthGuard>
    </AppShell>
  );
}

function summarizeDocuments(
  property: PropertyRecord,
  documents: PropertyDocument[],
): DocumentSummary {
  return {
    propertyId: property.id,
    title: property.title,
    total: documents.length,
    pending: documents.filter((document) => document.status === "pending").length,
    approved: documents.filter((document) => document.status === "approved").length,
    rejected: documents.filter((document) => document.status === "rejected").length,
  };
}

function ModerationSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/80 p-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}
