import Link from "next/link";

import { formatExtent, titleCase } from "@/lib/format";
import type { PropertyRecord } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { Card, MapPreview } from "./ui";

export function PropertyCard({ property }: { property: PropertyRecord }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block"
    >
      <Card className="overflow-hidden transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-lg group-hover:shadow-slate-900/[0.07]">
        <div className="grid gap-0 xl:grid-cols-[220px_1fr]">
          <div className="hidden p-3 xl:block">
            <MapPreview
              label={
                property.survey_number
                  ? `Survey ${property.survey_number}`
                  : "Verified plot"
              }
            />
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap gap-2">
                  <StatusBadge value={property.listing_status} />
                  <StatusBadge value={property.verification_status} />
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {property.is_verified ? "Verified property" : "Under review"}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {property.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                  <span>
                    {[property.village, property.mandal, property.district]
                      .filter(Boolean)
                      .join(", ") || "Location not set"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{titleCase(property.property_type)}</span>
                  <span className="text-slate-300">•</span>
                  <span>{formatExtent(property.extent_sq_yards)}</span>
                </div>
              </div>
              <div className="rounded-[14px] border border-slate-100 bg-slate-50 px-4 py-3 text-left shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Listing type
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {titleCase(property.listing_type)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Survey {property.survey_number ?? "not set"}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-4">
              <CardFact label="Survey" value={property.survey_number ?? "Not set"} />
              <CardFact label="District" value={property.district ?? "Not set"} />
              <CardFact label="Mandal" value={property.mandal ?? "Not set"} />
              <CardFact label="Village" value={property.village ?? "Not set"} />
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Verified plot intelligence
              </div>
              <div className="text-sm font-semibold text-emerald-700">
                Open workspace
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function CardFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
