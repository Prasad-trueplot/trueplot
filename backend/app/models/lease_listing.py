from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ListingStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class LeaseListing(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "lease_listings"

    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id"),
        index=True,
    )
    monthly_rent: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    security_deposit: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    lease_term_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    available_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[ListingStatus] = mapped_column(
        Enum(ListingStatus, name="lease_listing_status"),
        default=ListingStatus.DRAFT,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    supports_leasing: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    terms: Mapped[str | None] = mapped_column(Text, nullable=True)

    property = relationship("Property", back_populates="lease_listings")

