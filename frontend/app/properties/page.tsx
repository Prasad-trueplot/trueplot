"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PropertyCard } from "@/components/PropertyCard";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import type { ListingType, PropertyRecord } from "@/lib/types";
import { api } from "@/lib/api";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [listingType, setListingType] = useState<ListingType | "all">("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true);
      setError(null);
      try {
        setProperties(await api.listProperties());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProperties();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const matchesType =
        listingType === "all" || property.listing_type === listingType;
      const haystack = [
        property.title,
        property.district,
        property.mandal,
        property.village,
        property.survey_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesType && haystack.includes(query.toLowerCase());
    });
  }, [properties, listingType, query]);

  return (
    <AppShell>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Property listings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse sale and lease listings across Andhra Pradesh locations.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="w-fit rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Create listing
        </Link>
      </div>

      <section className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search district, mandal, village, survey number"
        />
        <select
          value={listingType}
          onChange={(event) =>
            setListingType(event.target.value as ListingType | "all")
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All listing types</option>
          <option value="sale">Sale</option>
          <option value="lease">Lease</option>
          <option value="sale_or_lease">Sale or lease</option>
        </select>
      </section>

      <div className="mt-5">
        {isLoading ? (
          <LoadingBlock label="Loading property listings" />
        ) : error ? (
          <ErrorBlock message={error} />
        ) : (
          <div className="grid gap-4">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
                No listings match the current filters.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}

