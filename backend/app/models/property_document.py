from uuid import UUID

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import DocumentStatus, DocumentType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class PropertyDocument(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "property_documents"

    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id"),
        index=True,
    )
    uploaded_by_user_id: Mapped[UUID | None] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, name="document_type"),
        default=DocumentType.OTHER,
        nullable=False,
        index=True,
    )
    file_name: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stored_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus, name="document_status"),
        default=DocumentStatus.PENDING,
        nullable=False,
        index=True,
    )
    ocr_extraction_status: Mapped[str] = mapped_column(
        String(24),
        default="pending",
        nullable=False,
        index=True,
    )
    ocr_extraction_method: Mapped[str | None] = mapped_column(
        String(40),
        nullable=True,
    )
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_extraction_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_extracted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    admin_review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    property = relationship("Property", back_populates="documents")
    uploaded_by = relationship("User", back_populates="uploaded_documents")
