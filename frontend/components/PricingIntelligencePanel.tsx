"use client";

import { useMemo, useState } from "react";

import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ListingType, PropertyPricingEstimate } from "@/lib/types";

import { ErrorBlock } from "./StateBlock";
import { StatusBadge } from "./StatusBadge";
import { Button, Card } from "./ui";

function basisLabel(value: string) {
  if (value === "monthly_lease") return "Monthly lease estimate";
  return "Sale value estimate";
}

function confidenceLabel(score: number) {
  if (score >= 78) return "Strong";
  if (score >= 68) return "Moderate";
  return "Early signal";
}

function pillTone(listingType: ListingType) {
  return listingType === "lease"
    ? "border-cyan-200 bg-cyan-50 text-cyan-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function PricingIntelligencePanel({
  propertyId,
  listingType,
  estimates,
}: {
  propertyId: string;
  listingType: ListingType;
  estimates: PropertyPricingEstimate[];
}) {
  const [items, setItems] = useState(estimates);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestEstimate = useMemo(() => items[0] ?? null, [items]);

  async function generateEstimate() {
    setIsGenerating(true);
    setError(null);
    try {
      const estimate = await api.generatePricingEstimate(propertyId);
      setItems((current) => [estimate, ...current]);
    } catch (generateError) {
      setError(
        generateError instanceof Error ? generateError.message : "Estimate failed",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              AI market intelligence
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Fair market value
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              AI-assisted pricing estimate for planning and review only. Not an official valuation.
            </p>
          </div>
          <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${pillTone(listingType)}`}>
            {listingType === "lease" ? "Lease intelligence" : "Sale intelligence"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generateEstimate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate price estimate"}
          </Button>
          {latestEstimate ? (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              Updated {formatDate(latestEstimate.created_at)}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <ErrorBlock message={error} />
        </div>
      ) : null}

      {!latestEstimate ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600">
          No pricing estimate has been generated yet. Use the CTA above to create
          a placeholder fair market value signal for this property.
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {basisLabel(latestEstimate.pricing_basis)}
                </p>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(latestEstimate.estimated_low_amount)} -{" "}
                  {formatCurrency(latestEstimate.estimated_high_amount)}
                </div>
                <p className="mt-2 text-sm text-slate-600">{latestEstimate.content}</p>
              </div>
              <div className="min-w-40 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Confidence
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {latestEstimate.confidence_score.toFixed(1)}%
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {confidenceLabel(latestEstimate.confidence_score)}
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(latestEstimate.confidence_score, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <MetricChip label="District influence" value={latestEstimate.district_influence} />
            <MetricChip label="Mandal influence" value={latestEstimate.mandal_influence} />
            <MetricChip label="Village influence" value={latestEstimate.village_influence} />
            <MetricChip label="Road/highway proximity" value={latestEstimate.road_highway_proximity} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Pricing factors
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {latestEstimate.pricing_factors.length > 0 ? (
                latestEstimate.pricing_factors.map((factor) => (
                  <span
                    key={factor}
                    className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {factor}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No factor details available.</span>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoCard
              title="Market notes"
              value={latestEstimate.market_notes}
            />
            <InfoCard
              title="Disclaimer"
              value={latestEstimate.disclaimer}
              emphasize
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <StatusBadge value={latestEstimate.is_mock ? "pending" : "verified"} />
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {latestEstimate.model_name ?? "Model not set"}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {latestEstimate.is_mock ? "Placeholder valuation" : "Model-backed estimate"}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

function MetricChip({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        {value ?? "Not set"}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  value,
  emphasize = false,
}: {
  title: string;
  value: string | null;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        emphasize ? "border-amber-200 bg-amber-50/80" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        {value ?? "Not generated"}
      </p>
    </div>
  );
}
