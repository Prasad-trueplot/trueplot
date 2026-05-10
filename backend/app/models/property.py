from decimal import Decimal
from uuid import UUID

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ListingStatus, ListingType, PropertyType, VerificationStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Property(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "properties"

    owner_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id"),
        index=True,
    )
    assigned_agent_id: Mapped[UUID | None] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    property_type: Mapped[PropertyType] = mapped_column(
        Enum(PropertyType, name="property_type"),
        default=PropertyType.LAND,
        nullable=False,
    )
    listing_type: Mapped[ListingType] = mapped_column(
        Enum(ListingType, name="listing_type"),
        default=ListingType.SALE,
        nullable=False,
        index=True,
    )
    address_line: Mapped[str | None] = mapped_column(String(500), nullable=True)
    village: Mapped[str | None] = mapped_column(String(120), nullable=True)
    mandal: Mapped[str | None] = mapped_column(String(120), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    state: Mapped[str] = mapped_column(String(120), default="Andhra Pradesh")
    survey_number: Mapped[str | None] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    extent_sq_yards: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status"),
        default=VerificationStatus.PENDING,
        nullable=False,
    )
    listing_status: Mapped[ListingStatus] = mapped_column(
        Enum(ListingStatus, name="listing_status"),
        default=ListingStatus.DRAFT,
        nullable=False,
        index=True,
    )

    owner = relationship("User", back_populates="properties")
    assigned_agent = relationship("Agent", back_populates="assigned_properties")
    documents = relationship(
        "PropertyDocument",
        back_populates="property",
        cascade="all, delete-orphan",
    )
    leads = relationship("Lead", back_populates="property", cascade="all, delete-orphan")
    lease_listings = relationship(
        "LeaseListing",
        back_populates="property",
        cascade="all, delete-orphan",
    )
    ai_summaries = relationship(
        "AISummary",
        back_populates="property",
        cascade="all, delete-orphan",
    )
