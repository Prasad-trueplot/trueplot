import Link from "next/link";

import { formatExtent, titleCase } from "@/lib/format";
import type { PropertyRecord } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

export function PropertyCard({ property }: { property: PropertyRecord }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-700 hover:shadow-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{property.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {[property.village, property.mandal, property.district]
              .filter(Boolean)
              .join(", ") || "Location not set"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={property.listing_status} />
          <StatusBadge value={property.verification_status} />
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Listing</p>
          <p className="font-medium">{titleCase(property.listing_type)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Type</p>
          <p className="font-medium">{titleCase(property.property_type)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Survey</p>
          <p className="font-medium">{property.survey_number ?? "Not set"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Extent</p>
          <p className="font-medium">{formatExtent(property.extent_sq_yards)}</p>
        </div>
      </div>
    </Link>
  );
}

