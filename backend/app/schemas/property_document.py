from uuid import UUID

from app.models.enums import DocumentStatus, DocumentType
from app.schemas.base import ORMBaseModel, TimestampReadMixin


class PropertyDocumentBase(ORMBaseModel):
    property_id: UUID
    uploaded_by_user_id: UUID | None = None
    document_type: DocumentType
    file_name: str
    original_filename: str | None = None
    stored_filename: str | None = None
    content_type: str | None = None
    file_size_bytes: int | None = None
    file_url: str | None = None
    status: DocumentStatus = DocumentStatus.PENDING
    is_verified: bool = False
    notes: str | None = None
    admin_review_notes: str | None = None


class PropertyDocumentCreate(PropertyDocumentBase):
    pass


class PropertyDocumentUpdate(ORMBaseModel):
    document_type: DocumentType | None = None
    file_name: str | None = None
    original_filename: str | None = None
    stored_filename: str | None = None
    content_type: str | None = None
    file_size_bytes: int | None = None
    file_url: str | None = None
    status: DocumentStatus | None = None
    is_verified: bool | None = None
    notes: str | None = None
    admin_review_notes: str | None = None


class PropertyDocumentRead(TimestampReadMixin, PropertyDocumentBase):
    pass


class PropertyDocumentReviewUpdate(ORMBaseModel):
    status: DocumentStatus
    is_verified: bool = False
    admin_review_notes: str | None = None
