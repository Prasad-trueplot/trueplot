from uuid import UUID

from app.models.enums import AISummaryType
from app.schemas.base import ORMBaseModel, TimestampReadMixin


class AISummaryBase(ORMBaseModel):
    property_id: UUID
    document_id: UUID | None = None
    created_by_user_id: UUID | None = None
    summary_type: AISummaryType = AISummaryType.PROPERTY
    content: str
    english_summary: str | None = None
    telugu_summary: str | None = None
    ownership_summary: str | None = None
    document_insights: str | None = None
    risk_flags: str | None = None
    recommended_next_steps: str | None = None
    disclaimer: str | None = None
    model_name: str | None = None
    is_mock: bool = True
    is_verified: bool = False


class AISummaryCreate(AISummaryBase):
    pass


class AISummaryUpdate(ORMBaseModel):
    summary_type: AISummaryType | None = None
    content: str | None = None
    english_summary: str | None = None
    telugu_summary: str | None = None
    ownership_summary: str | None = None
    document_insights: str | None = None
    risk_flags: str | None = None
    recommended_next_steps: str | None = None
    disclaimer: str | None = None
    model_name: str | None = None
    is_mock: bool | None = None
    is_verified: bool | None = None


class AISummaryRead(TimestampReadMixin, AISummaryBase):
    pass


class AISummaryGenerateRequest(ORMBaseModel):
    created_by_user_id: UUID | None = None
