"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { Agent, PropertyRecord } from "@/lib/types";

import { ErrorBlock, LoadingBlock } from "./StateBlock";
import { StatusBadge } from "./StatusBadge";

export function AgentAssignmentPanel({
  property,
  onChange,
}: {
  property: PropertyRecord;
  onChange: (property: PropertyRecord) => void;
}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState(
    property.assigned_agent_id ?? "",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      setIsLoading(true);
      setError(null);
      try {
        setAgents(await api.listAgents(true));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAgents();
  }, []);

  useEffect(() => {
    setSelectedAgentId(property.assigned_agent_id ?? "");
  }, [property.assigned_agent_id]);

  const assignedAgent = useMemo(
    () => agents.find((agent) => agent.id === property.assigned_agent_id),
    [agents, property.assigned_agent_id],
  );

  async function saveAssignment(agentId: string | null) {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await api.assignAgentToProperty(property.id, agentId);
      onChange(updated);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Assignment failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Verified agent</h2>
      {isLoading ? (
        <div className="mt-4">
          <LoadingBlock label="Loading verified agents" />
        </div>
      ) : (
        <>
          {assignedAgent ? (
            <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {assignedAgent.agency_name ?? "Assigned agent"}
                  </p>
                  <p className="mt-1 text-slate-600">
                    {assignedAgent.service_area ?? "Service area not set"}
                  </p>
                </div>
                <StatusBadge value="verified" />
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
              No verified agent assigned.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3">
            <select
              value={selectedAgentId}
              onChange={(event) => setSelectedAgentId(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">No agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.agency_name ?? agent.license_number ?? agent.id}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => saveAssignment(selectedAgentId || null)}
                disabled={isSaving}
                className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Assign agent"}
              </button>
              <button
                onClick={() => saveAssignment(null)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}
      {error ? <div className="mt-4"><ErrorBlock message={error} /></div> : null}
    </div>
  );
}

