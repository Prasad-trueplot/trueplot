from uuid import UUID

from app.models.enums import InterestType, LeadStatus
from app.schemas.base import ORMBaseModel, TimestampReadMixin


class LeadBase(ORMBaseModel):
    property_id: UUID
    user_id: UUID | None = None
    agent_id: UUID | None = None
    contact_name: str
    contact_phone: str | None = None
    contact_email: str | None = None
    interest_type: InterestType = InterestType.BUY
    status: LeadStatus = LeadStatus.NEW
    notes: str | None = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(ORMBaseModel):
    agent_id: UUID | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    interest_type: InterestType | None = None
    status: LeadStatus | None = None
    notes: str | None = None


class LeadRead(TimestampReadMixin, LeadBase):
    pass

