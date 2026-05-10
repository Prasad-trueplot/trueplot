"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, Card, DetailTile } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Agent } from "@/lib/types";

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgent() {
      setIsLoading(true);
      setError(null);
      try {
        setAgent(await api.getAgent(params.id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAgent();
  }, [params.id]);

  async function approveAgent() {
    setIsSaving(true);
    setError(null);
    try {
      setAgent(await api.updateAgentVerification(params.id, true));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Approval failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <Link href="/agents" className="text-sm font-semibold text-emerald-900">
        Back to agents
      </Link>
      {isLoading ? (
        <div className="mt-5">
          <LoadingBlock label="Loading agent" />
        </div>
      ) : error ? (
        <div className="mt-5">
          <ErrorBlock message={error} />
        </div>
      ) : agent ? (
        <Card className="mt-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <StatusBadge value={agent.is_verified ? "verified" : "pending"} />
              <h1 className="mt-4 text-4xl font-semibold text-slate-950">
                {agent.agency_name ?? "Independent agent"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {agent.service_area ?? "Service area not set"}
              </p>
            </div>
            <AuthGuard roles={["admin"]}>
              <Button
                onClick={approveAgent}
                disabled={isSaving || agent.is_verified}
                className="w-fit"
              >
                {agent.is_verified ? "Verified" : isSaving ? "Approving..." : "Approve agent"}
              </Button>
            </AuthGuard>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <DetailTile label="License" value={agent.license_number ?? "Not set"} />
            <DetailTile label="Districts" value={agent.district_specialization ?? "Not set"} />
            <DetailTile label="Mandals" value={agent.mandal_specialization ?? "Not set"} />
            <DetailTile label="Villages" value={agent.village_specialization ?? "Not set"} />
            <DetailTile label="Leasing" value={agent.supports_leasing ? "Supported" : "No"} />
            <DetailTile label="NRI" value={agent.supports_nri ? "Supported" : "No"} />
            <DetailTile label="Created" value={formatDate(agent.created_at)} />
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
