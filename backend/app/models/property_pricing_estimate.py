from uuid import UUID

from sqlalchemy import Boolean, Enum, Float, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ListingType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class PropertyPricingEstimate(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "property_pricing_estimates"

    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id"),
        index=True,
    )
    created_by_user_id: Mapped[UUID | None] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    listing_type: Mapped[ListingType] = mapped_column(
        Enum(ListingType, name="pricing_listing_type"),
        nullable=False,
        index=True,
    )
    pricing_basis: Mapped[str] = mapped_column(String(40), nullable=False)
    content: Mapped[str] = mapped_column(Text)
    estimated_low_amount: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_high_amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(12), default="INR", nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    pricing_factors: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    district_influence: Mapped[str | None] = mapped_column(Text, nullable=True)
    mandal_influence: Mapped[str | None] = mapped_column(Text, nullable=True)
    village_influence: Mapped[str | None] = mapped_column(Text, nullable=True)
    road_highway_proximity: Mapped[str | None] = mapped_column(Text, nullable=True)
    market_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    disclaimer: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    property = relationship("Property", back_populates="pricing_estimates")
    created_by = relationship("User")
