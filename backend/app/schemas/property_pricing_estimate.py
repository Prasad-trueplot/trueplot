from uuid import UUID

from pydantic import Field

from app.models.enums import ListingType
from app.schemas.base import ORMBaseModel, TimestampReadMixin


class PropertyPricingEstimateBase(ORMBaseModel):
    property_id: UUID
    created_by_user_id: UUID | None = None
    listing_type: ListingType
    pricing_basis: str
    content: str
    estimated_low_amount: float
    estimated_high_amount: float
    currency: str = "INR"
    confidence_score: float
    pricing_factors: list[str] = Field(default_factory=list)
    district_influence: str | None = None
    mandal_influence: str | None = None
    village_influence: str | None = None
    road_highway_proximity: str | None = None
    market_notes: str | None = None
    disclaimer: str | None = None
    model_name: str | None = None
    is_mock: bool = True


class PropertyPricingEstimateCreate(PropertyPricingEstimateBase):
    pass


class PropertyPricingEstimateUpdate(ORMBaseModel):
    content: str | None = None
    estimated_low_amount: float | None = None
    estimated_high_amount: float | None = None
    currency: str | None = None
    confidence_score: float | None = None
    pricing_factors: list[str] | None = None
    district_influence: str | None = None
    mandal_influence: str | None = None
    village_influence: str | None = None
    road_highway_proximity: str | None = None
    market_notes: str | None = None
    disclaimer: str | None = None
    model_name: str | None = None
    is_mock: bool | None = None
    pricing_basis: str | None = None
    listing_type: ListingType | None = None


class PropertyPricingEstimateRead(TimestampReadMixin, PropertyPricingEstimateBase):
    pass


class PropertyPricingEstimateGenerateRequest(ORMBaseModel):
    created_by_user_id: UUID | None = None
