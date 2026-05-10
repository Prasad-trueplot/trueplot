import Link from "next/link";

import type { Agent } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { Card } from "./ui";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group block"
    >
      <Card className="p-5 transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-lg group-hover:shadow-slate-900/[0.07]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Verified agent network
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {agent.agency_name ?? "Independent verified agent"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {agent.service_area ?? "Service area not set"}
            </p>
          </div>
          <StatusBadge value={agent.is_verified ? "verified" : "pending"} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Tag>{agent.district_specialization ?? "District not set"}</Tag>
          <Tag>{agent.mandal_specialization ?? "Mandal not set"}</Tag>
          <Tag>{agent.village_specialization ?? "Village not set"}</Tag>
          <Tag variant="green">{agent.supports_leasing ? "Leasing" : "No leasing"}</Tag>
          <Tag variant="gold">{agent.supports_nri ? "NRI" : "Local only"}</Tag>
        </div>
      </Card>
    </Link>
  );
}

function Tag({
  children,
  variant = "default",
}: {
  children: string;
  variant?: "default" | "green" | "gold";
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        variant === "green"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : variant === "gold"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}
