from __future__ import annotations

import hashlib
import math
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

from app.models.enums import ListingType
from app.models.property import Property


@dataclass(slots=True)
class PricingEstimateResult:
    content: str
    estimated_low_amount: float
    estimated_high_amount: float
    currency: str
    confidence_score: float
    pricing_factors: list[str]
    district_influence: str
    mandal_influence: str
    village_influence: str
    road_highway_proximity: str
    market_notes: str
    disclaimer: str
    model_name: str
    is_mock: bool
    pricing_basis: str


def generate_pricing_estimate(property_record: Property) -> PricingEstimateResult:
    listing_type = property_record.listing_type
    extent = float(property_record.extent_sq_yards or 0)
    area_factor = _area_factor(extent)
    location_factor = _location_factor(
        property_record.district, property_record.mandal, property_record.village
    )
    road_factor, road_note = _road_factor(
        property_record.district, property_record.mandal, property_record.survey_number
    )
    type_factor = 1.0 if property_record.property_type == "land" else 1.06
    base_rate = 0.0
    pricing_basis = "sale_price"
    if listing_type == ListingType.LEASE:
        base_rate = 42.0
        pricing_basis = "monthly_lease"
    else:
        base_rate = 4300.0

    composite_factor = type_factor * area_factor * location_factor * road_factor
    if extent > 0:
        center_value = extent * base_rate * composite_factor
    else:
        center_value = base_rate * composite_factor * (14 if listing_type == ListingType.LEASE else 1200)

    spread_ratio = 0.14 if listing_type == ListingType.SALE else 0.16
    low_amount = center_value * (1 - spread_ratio)
    high_amount = center_value * (1 + spread_ratio)

    confidence = _confidence_score(property_record)
    pricing_factors = [
        f"Listing type: {listing_type.value.replace('_', ' ')}",
        f"Property type: {property_record.property_type.value}",
        f"Extent signal: {'Provided' if extent > 0 else 'Not provided'}",
        f"Location completeness: {location_factor_label(property_record.district, property_record.mandal, property_record.village)}",
        f"Road access placeholder: {road_note}",
    ]
    if property_record.assigned_agent_id:
        pricing_factors.append("Assigned verified agent context available")

    district_influence = _influence_sentence(
        property_record.district,
        "district",
        listing_type,
    )
    mandal_influence = _influence_sentence(
        property_record.mandal,
        "mandal",
        listing_type,
    )
    village_influence = _influence_sentence(
        property_record.village,
        "village",
        listing_type,
    )
    market_notes = (
        "Local placeholder estimate generated from listing metadata, location signals, and "
        f"basic comparative logic. {road_note} "
        "Use this only as a demo planning signal."
    )
    disclaimer = (
        "AI-assisted estimate for review only. This is not an official valuation, "
        "not financial advice, and must not be used as a legal or bank-approved price."
    )

    content = (
        f"Placeholder {listing_type.value.replace('_', ' ')} pricing estimate for "
        f"{property_record.title or 'the selected property'}."
    )

    return PricingEstimateResult(
        content=content,
        estimated_low_amount=_round_currency(low_amount),
        estimated_high_amount=_round_currency(high_amount),
        currency="INR",
        confidence_score=_round_decimal(confidence),
        pricing_factors=pricing_factors,
        district_influence=district_influence,
        mandal_influence=mandal_influence,
        village_influence=village_influence,
        road_highway_proximity=road_note,
        market_notes=market_notes,
        disclaimer=disclaimer,
        model_name="trueplot-pricing-placeholder-v1",
        is_mock=True,
        pricing_basis=pricing_basis,
    )


def _location_factor(
    district: str | None, mandal: str | None, village: str | None
) -> float:
    token = "|".join(part.strip().lower() for part in [district or "", mandal or "", village or ""])
    if not token.strip("|"):
        return 0.93
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    score = int(digest[:6], 16) / 0xFFFFFF
    return 0.88 + score * 0.32


def _road_factor(
    district: str | None, mandal: str | None, survey_number: str | None
) -> tuple[float, str]:
    token = "|".join(part.strip().lower() for part in [district or "", mandal or "", survey_number or ""])
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    bucket = int(digest[6:8], 16) % 4
    if bucket == 0:
        return 1.12, "Placeholder indicates stronger road or highway access potential."
    if bucket == 1:
        return 1.04, "Placeholder indicates moderate road access potential."
    if bucket == 2:
        return 0.96, "Placeholder indicates neutral road access; verify approach road."
    return 0.9, "Placeholder indicates limited road access signal; verify highway proximity."


def _area_factor(extent_sq_yards: float) -> float:
    if extent_sq_yards <= 0:
        return 1.0
    normalized = math.log10(max(extent_sq_yards, 10.0))
    return max(0.82, min(1.1, 1.14 - normalized * 0.06))


def _confidence_score(property_record: Property) -> float:
    score = 58.0
    if property_record.district:
        score += 7
    if property_record.mandal:
        score += 6
    if property_record.village:
        score += 5
    if property_record.survey_number:
        score += 5
    if property_record.latitude and property_record.longitude:
        score += 5
    if property_record.extent_sq_yards:
        score += 7
    if property_record.listing_type == ListingType.LEASE:
        score -= 1
    return min(score, 84.0)


def _round_currency(value: float) -> float:
    return float(Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _round_decimal(value: float) -> float:
    return float(Decimal(value).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def location_factor_label(
    district: str | None, mandal: str | None, village: str | None
) -> str:
    filled = sum(1 for part in (district, mandal, village) if part)
    if filled == 3:
        return "High"
    if filled == 2:
        return "Medium"
    if filled == 1:
        return "Low"
    return "Minimal"


def _influence_sentence(
    value: str | None, label: str, listing_type: ListingType
) -> str:
    if value:
        trend = "supportive" if listing_type == ListingType.SALE else "lease-sensitive"
        return f"{label.title()} signal from '{value}' is {trend} in this placeholder model."
    return f"{label.title()} signal is limited; placeholder assumes neutral influence."
