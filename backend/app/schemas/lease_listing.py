from datetime import date
from decimal import Decimal
from uuid import UUID

from app.models.enums import ListingStatus
from app.schemas.base import ORMBaseModel, TimestampReadMixin


class LeaseListingBase(ORMBaseModel):
    property_id: UUID
    monthly_rent: Decimal
    security_deposit: Decimal | None = None
    lease_term_months: int | None = None
    available_from: date | None = None
    status: ListingStatus = ListingStatus.DRAFT
    is_active: bool = True
    supports_leasing: bool = True
    terms: str | None = None


class LeaseListingCreate(LeaseListingBase):
    pass


class LeaseListingUpdate(ORMBaseModel):
    monthly_rent: Decimal | None = None
    security_deposit: Decimal | None = None
    lease_term_months: int | None = None
    available_from: date | None = None
    status: ListingStatus | None = None
    is_active: bool | None = None
    supports_leasing: bool | None = None
    terms: str | None = None


class LeaseListingRead(TimestampReadMixin, LeaseListingBase):
    pass

