"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AgentCard } from "@/components/AgentCard";
import { AppShell } from "@/components/AppShell";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { api } from "@/lib/api";
import type { Agent } from "@/lib/types";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      setIsLoading(true);
      setError(null);
      try {
        setAgents(await api.listAgents());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAgents();
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Verified agents</h1>
          <p className="mt-2 text-sm text-slate-600">
            Onboard AP land specialists for sale, lease, NRI, district, mandal,
            and village workflows.
          </p>
        </div>
        <Link
          href="/agents/new"
          className="w-fit rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Onboard agent
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {isLoading ? (
          <LoadingBlock label="Loading agents" />
        ) : error ? (
          <ErrorBlock message={error} />
        ) : agents.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No agents yet.
          </div>
        ) : (
          agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
        )}
      </div>
    </AppShell>
  );
}

