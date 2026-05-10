from uuid import UUID

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AISummaryType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class AISummary(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_summaries"

    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id"),
        index=True,
    )
    document_id: Mapped[UUID | None] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("property_documents.id"),
        nullable=True,
        index=True,
    )
    created_by_user_id: Mapped[UUID | None] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    summary_type: Mapped[AISummaryType] = mapped_column(
        Enum(AISummaryType, name="ai_summary_type"),
        default=AISummaryType.PROPERTY,
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text)
    english_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    telugu_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ownership_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    document_insights: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_flags: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommended_next_steps: Mapped[str | None] = mapped_column(Text, nullable=True)
    disclaimer: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    property = relationship("Property", back_populates="ai_summaries")
    document = relationship("PropertyDocument")
    created_by = relationship("User", back_populates="ai_summaries")
