"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PropertyCard } from "@/components/PropertyCard";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { HealthResponse, PropertyRecord } from "@/lib/types";

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const [healthResponse, propertyResponse] = await Promise.all([
          api.health(),
          api.listProperties(),
        ]);
        setHealth(healthResponse);
        setProperties(propertyResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const stats = useMemo(() => {
    return {
      total: properties.length,
      active: properties.filter((property) => property.listing_status === "active")
        .length,
      verified: properties.filter((property) => property.is_verified).length,
      lease: properties.filter(
        (property) =>
          property.listing_type === "lease" ||
          property.listing_type === "sale_or_lease",
      ).length,
    };
  }, [properties]);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-emerald-800">
                Founder demo dashboard
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal md:text-5xl">
                Verified AP property listing workflow from upload to AI review.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Manage sale and lease listings, land document review, AI-assisted
                legal summaries, and moderation actions from one local MVP.
              </p>
            </div>
            <StatusBadge value={health?.status === "ok" ? "active" : "pending"} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/properties/new"
              className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
            >
              Create listing
            </Link>
            <Link
              href="/properties"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
            >
              View listings
            </Link>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Backend connection</h2>
          <p className="mt-2 text-sm text-slate-600">{api.baseUrl}</p>
          <div className="mt-5 rounded-md bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Health</p>
            <p className="mt-2 text-sm font-medium">
              {health ? `${health.service} is ${health.status}` : "Checking"}
            </p>
          </div>
        </aside>
      </div>

      {isLoading ? (
        <div className="mt-6">
          <LoadingBlock label="Loading dashboard data" />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorBlock message={error} />
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Total listings" value={stats.total} />
            <Metric label="Active listings" value={stats.active} />
            <Metric label="Verified properties" value={stats.verified} />
            <Metric label="Lease enabled" value={stats.lease} />
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent properties</h2>
              <Link
                href="/properties"
                className="text-sm font-semibold text-emerald-900"
              >
                See all
              </Link>
            </div>
            <div className="grid gap-4">
              {properties.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              {properties.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  No properties yet. Create the first listing for the demo.
                </div>
              ) : null}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

