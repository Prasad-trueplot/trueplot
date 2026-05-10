"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { PropertyCard } from "@/components/PropertyCard";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Button,
  ButtonLink,
  Card,
  FieldShell,
  MapPreview,
  MetricCard,
  inputStyles,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { HealthResponse, PropertyRecord } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [heroQuery, setHeroQuery] = useState("");
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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = heroQuery.trim();
    router.push(value ? `/properties?query=${encodeURIComponent(value)}` : "/properties");
  }

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
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,162,42,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(45,107,47,0.08),transparent_24%)]" />
        <div className="relative grid gap-0 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-7 md:p-10 lg:p-12">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={health?.status === "ok" ? "active" : "pending"} />
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Andhra Pradesh verified property intelligence
              </span>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Search verified land, lease, and legal intelligence in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              TRUEPLOT brings together property listings, document review, AI-assisted
              legal summaries, and verified agents for a cleaner AP real-estate workflow.
            </p>
            <form onSubmit={submitSearch} className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
              <FieldShell label="Search location, survey number, or district">
                <input
                  value={heroQuery}
                  onChange={(event) => setHeroQuery(event.target.value)}
                  className={inputStyles}
                  placeholder="e.g. Guntur, Tadepalli, 123/4A"
                />
              </FieldShell>
              <div className="flex items-end">
                <Button type="submit" className="w-full md:w-auto">
                  Search properties
                </Button>
              </div>
            </form>
            <div className="mt-7 flex flex-wrap gap-2">
              <HeroChip href="/properties?listing_type=sale" label="Sale" />
              <HeroChip href="/properties?listing_type=lease" label="Lease" />
              <HeroChip href="/agents" label="Verified agents" />
              <HeroChip href="/#legal-review" label="AI legal review" />
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-4 lg:border-l lg:border-t-0">
            <MapPreview label="Verified inventory map" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Signal label="AI review" value="Document-ready" />
              <Signal label="Agent layer" value="Verified" />
              <Signal label="Leasing" value="Supported" />
              <Signal label="Trust" value="AP focused" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CategoryCard title="Buy plots" copy="Sale listings with verified document and location context." href="/properties?listing_type=sale" />
        <CategoryCard title="Lease space" copy="Lease-ready inventory for land and commercial workflows." href="/properties?listing_type=lease" />
        <CategoryCard title="Verified agents" copy="Specialists for district, mandal, village, and NRI coverage." href="/agents" />
        <CategoryCard title="AI legal review" copy="English and Telugu summary fields with risk flags and next steps." href="/#legal-review" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">Platform health</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Local backend connection, API readiness, and demo workflow status.
          </p>
          <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Backend
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-950">
              {api.baseUrl}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Health
              </p>
              <p className="mt-1 text-sm font-semibold">
                {health ? `${health.service} is ${health.status}` : "Checking"}
              </p>
            </div>
            <StatusBadge value={health?.status === "ok" ? "active" : "pending"} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">Trusted workflow</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A founder-friendly layer for verification, legal review, and agent assignment.
          </p>
          <div className="mt-5 space-y-3">
            <WorkflowStep title="Verified property intelligence" copy="District, mandal, village, survey number, and geospatial context." />
            <WorkflowStep title="AI legal review" copy="Document summaries, risk flags, and next steps for review." />
            <WorkflowStep title="Trusted agent network" copy="Approved specialists for sale, lease, and NRI workflows." />
          </div>
        </Card>
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
            <MetricCard label="Total listings" value={stats.total} detail="Across AP demo data" />
            <MetricCard label="Active listings" value={stats.active} detail="Marketplace ready" />
            <MetricCard label="Verified properties" value={stats.verified} detail="Trust marked" />
            <MetricCard label="Lease enabled" value={stats.lease} detail="Rental workflow" />
          </section>

          <section id="legal-review" className="mt-6 grid gap-4 lg:grid-cols-3">
            <PlatformPillar
              title="AI legal summaries"
              copy="Document insights, risk flags, ownership notes, and recommended next steps are structured for review."
            />
            <PlatformPillar
              title="District intelligence"
              copy="Search and evaluate by district, mandal, village, survey number, and geospatial fields."
            />
            <PlatformPillar
              title="Verified agent layer"
              copy="Approved local specialists can be assigned to listings for sale, lease, and NRI workflows."
            />
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Featured property workspaces</h2>
              <Link
                href="/properties"
                className="text-sm font-semibold text-slate-700 hover:text-slate-950"
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

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function HeroChip({ href, label }: { href: string; label: string }) {
  return (
    <ButtonLink href={href} variant="secondary" className="rounded-full px-4">
      {label}
    </ButtonLink>
  );
}

function CategoryCard({
  title,
  copy,
  href,
}: {
  title: string;
  copy: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="h-full rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-md">
        <div className="mb-5 h-1.5 w-14 rounded-full bg-slate-950" />
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
      </div>
    </Link>
  );
}

function WorkflowStep({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-[16px] border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
    </div>
  );
}

function PlatformPillar({ title, copy }: { title: string; copy: string }) {
  return (
    <Card className="p-5">
      <div className="mb-5 h-1 w-12 rounded-full bg-slate-950" />
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
    </Card>
  );
}
