from decimal import Decimal
from uuid import UUID

from pydantic import Field, model_validator

from app.models.enums import ListingStatus, ListingType, PropertyType, VerificationStatus
from app.schemas.base import ORMBaseModel, TimestampReadMixin


class PropertyBase(ORMBaseModel):
    owner_id: UUID
    assigned_agent_id: UUID | None = None
    title: str
    description: str | None = None
    property_type: PropertyType = PropertyType.LAND
    listing_type: ListingType = ListingType.SALE
    address_line: str | None = None
    village: str | None = None
    mandal: str | None = None
    district: str | None = None
    state: str = "Andhra Pradesh"
    survey_number: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    extent_sq_yards: Decimal | None = None
    is_verified: bool = False
    verification_status: VerificationStatus = VerificationStatus.PENDING
    listing_status: ListingStatus = ListingStatus.DRAFT


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(ORMBaseModel):
    assigned_agent_id: UUID | None = None
    title: str | None = None
    description: str | None = None
    property_type: PropertyType | None = None
    listing_type: ListingType | None = None
    address_line: str | None = None
    village: str | None = None
    mandal: str | None = None
    district: str | None = None
    state: str | None = None
    survey_number: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    extent_sq_yards: Decimal | None = None
    is_verified: bool | None = None
    verification_status: VerificationStatus | None = None
    listing_status: ListingStatus | None = None


class PropertyRead(TimestampReadMixin, PropertyBase):
    pass


class PropertyStatusUpdate(ORMBaseModel):
    listing_status: ListingStatus


class PropertyVerificationUpdate(ORMBaseModel):
    is_verified: bool
    verification_status: VerificationStatus

    @model_validator(mode="after")
    def validate_verification_consistency(self) -> "PropertyVerificationUpdate":
        if self.is_verified and self.verification_status != VerificationStatus.VERIFIED:
            raise ValueError("Verified properties must use verification_status=verified")
        if not self.is_verified and self.verification_status == VerificationStatus.VERIFIED:
            raise ValueError("Unverified properties cannot use verification_status=verified")
        return self


class PropertyAgentAssignment(ORMBaseModel):
    agent_id: UUID | None
