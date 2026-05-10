from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Agent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "agents"

    user_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id"),
        unique=True,
    )
    license_number: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True
    )
    agency_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    service_area: Mapped[str | None] = mapped_column(String(255), nullable=True)
    district_specialization: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    mandal_specialization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    village_specialization: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    supports_leasing: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    supports_nri: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="agent_profile")
    assigned_properties = relationship("Property", back_populates="assigned_agent")
    leads = relationship("Lead", back_populates="agent")
