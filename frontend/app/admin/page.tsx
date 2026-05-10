"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type { Agent, PropertyRecord } from "@/lib/types";

export default function AdminPage() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true);
      setError(null);
      try {
        const [propertyResponse, agentResponse] = await Promise.all([
          api.listProperties(),
          api.listAgents(),
        ]);
        setProperties(propertyResponse);
        setAgents(agentResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProperties();
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
        <div>
          <h1 className="text-3xl font-semibold">Admin moderation</h1>
          <p className="mt-2 text-sm text-slate-600">
            Local MVP moderation controls for approving listings and marking AP
            property records as verified.
          </p>
        </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-semibold">Review queue</h2>
          <p className="mt-1 text-sm text-slate-600">
            {queue.length} listings need approval or verification.
          </p>
        </div>

        {isLoading ? (
          <div className="p-4">
            <LoadingBlock label="Loading moderation queue" />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorBlock message={error} />
          </div>
        ) : queue.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No listings need moderation.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {queue.map((property) => (
              <div
                key={property.id}
                className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <Link
                    href={`/properties/${property.id}`}
                    className="font-semibold hover:text-emerald-900"
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
                  <button
                    onClick={() =>
                      updateProperty(property.id, () =>
                        api.updatePropertyStatus(property.id, "active"),
                      )
                    }
                    disabled={busyId === property.id}
                    className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
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
                    className="rounded-md border border-emerald-800 px-3 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-60"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-semibold">Agent approval queue</h2>
          <p className="mt-1 text-sm text-slate-600">
            {agentQueue.length} agents need verification.
          </p>
        </div>
        {isLoading ? (
          <div className="p-4">
            <LoadingBlock label="Loading agent queue" />
          </div>
        ) : agentQueue.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No agents need approval.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {agentQueue.map((agent) => (
              <div
                key={agent.id}
                className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="font-semibold hover:text-emerald-900"
                  >
                    {agent.agency_name ?? "Independent agent"}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    {agent.district_specialization ?? "District not set"} ·{" "}
                    {agent.supports_leasing ? "Leasing" : "Sale"} ·{" "}
                    {agent.supports_nri ? "NRI supported" : "Local clients"}
                  </p>
                  <div className="mt-3">
                    <StatusBadge value="pending" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <button
                    onClick={() => approveAgent(agent.id)}
                    disabled={busyId === agent.id}
                    className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Approve agent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </section>
      </AuthGuard>
    </AppShell>
  );
}
