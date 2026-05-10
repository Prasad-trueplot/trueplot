import Link from "next/link";

import type { Agent } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-700 hover:shadow-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {agent.agency_name ?? "Independent verified agent"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {agent.service_area ?? "Service area not set"}
          </p>
        </div>
        <StatusBadge value={agent.is_verified ? "verified" : "pending"} />
      </div>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Districts</p>
          <p className="font-medium">{agent.district_specialization ?? "Not set"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Leasing</p>
          <p className="font-medium">{agent.supports_leasing ? "Supported" : "No"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">NRI</p>
          <p className="font-medium">{agent.supports_nri ? "Supported" : "No"}</p>
        </div>
      </div>
    </Link>
  );
}

