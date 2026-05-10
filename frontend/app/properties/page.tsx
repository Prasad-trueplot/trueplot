"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PropertyCard } from "@/components/PropertyCard";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import {
  Button,
  ButtonLink,
  Card,
  MapPreview,
  inputStyles,
  SectionHeader,
} from "@/components/ui";
import type { ListingType, PropertyRecord } from "@/lib/types";
import { api } from "@/lib/api";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [listingType, setListingType] = useState<ListingType | "all">("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("listing_type");
    if (type === "sale" || type === "lease" || type === "sale_or_lease") {
      setListingType(type);
    }
    const initialQuery = params.get("query");
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, []);

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
      <SectionHeader
        eyebrow="Marketplace"
        title="Property listings"
        description="Browse sale and lease listings across Andhra Pradesh with verification, document, and agent context."
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/properties/new">Create listing</ButtonLink>
            <ButtonLink href="/agents" variant="secondary">
              Trusted agents
            </ButtonLink>
          </div>
        }
      />

      <Card className="mt-6 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={inputStyles}
            placeholder="Search district, mandal, village, survey number"
          />
          <select
            value={listingType}
            onChange={(event) =>
              setListingType(event.target.value as ListingType | "all")
            }
            className={inputStyles}
          >
            <option value="all">All listing types</option>
            <option value="sale">Sale</option>
            <option value="lease">Lease</option>
            <option value="sale_or_lease">Sale or lease</option>
          </select>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={listingType === "all" ? "primary" : "secondary"}
              onClick={() => setListingType("all")}
            >
              All
            </Button>
            <Button
              variant={listingType === "sale" ? "primary" : "secondary"}
              onClick={() => setListingType("sale")}
            >
              Sale
            </Button>
            <Button
              variant={listingType === "lease" ? "primary" : "secondary"}
              onClick={() => setListingType("lease")}
            >
              Lease
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {isLoading ? (
          <LoadingBlock label="Loading property listings" />
        ) : error ? (
          <ErrorBlock message={error} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                Showing <span className="font-semibold text-slate-950">{filtered.length}</span> verified-ready listings
              </p>
              <p className="text-sm text-slate-500">Andhra Pradesh inventory</p>
            </div>
            <div className="grid gap-4">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              {filtered.length === 0 ? (
                <div className="rounded-[18px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  No listings match the current filters.
                </div>
              ) : null}
            </div>
          </div>
        )}

        <aside className="xl:sticky xl:top-28 xl:self-start">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Map view
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                Property geography
              </h2>
            </div>
            <div className="p-4">
              <MapPreview label="Marketplace map placeholder" />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
              <MarketStat label="Results" value={filtered.length} />
              <MarketStat
                label="Verified"
                value={filtered.filter((property) => property.is_verified).length}
              />
              <MarketStat
                label="Lease ready"
                value={
                  filtered.filter(
                    (property) =>
                      property.listing_type === "lease" ||
                      property.listing_type === "sale_or_lease",
                  ).length
                }
              />
              <MarketStat
                label="Sale"
                value={filtered.filter((property) => property.listing_type === "sale").length}
              />
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function MarketStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-lg font-semibold text-slate-950">{value}</span>
    </div>
  );
}
