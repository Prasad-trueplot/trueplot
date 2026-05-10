"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { Agent, PropertyRecord } from "@/lib/types";

import { ErrorBlock, LoadingBlock } from "./StateBlock";
import { StatusBadge } from "./StatusBadge";
import { Button, Card, inputStyles } from "./ui";

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
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
        Human network
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Verified agent</h2>
      {isLoading ? (
        <div className="mt-4">
          <LoadingBlock label="Loading verified agents" />
        </div>
      ) : (
        <>
          {assignedAgent ? (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-sm">
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
              className={inputStyles}
            >
              <option value="">No agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.agency_name ?? agent.license_number ?? agent.id}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => saveAssignment(selectedAgentId || null)}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Assign agent"}
              </Button>
              <Button
                onClick={() => saveAssignment(null)}
                disabled={isSaving}
                variant="secondary"
              >
                Remove
              </Button>
            </div>
          </div>
        </>
      )}
      {error ? <div className="mt-4"><ErrorBlock message={error} /></div> : null}
    </Card>
  );
}
