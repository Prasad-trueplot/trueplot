from uuid import UUID

from app.schemas.base import ORMBaseModel, TimestampReadMixin


class AgentBase(ORMBaseModel):
    user_id: UUID
    license_number: str | None = None
    agency_name: str | None = None
    service_area: str | None = None
    district_specialization: str | None = None
    mandal_specialization: str | None = None
    village_specialization: str | None = None
    supports_leasing: bool = False
    supports_nri: bool = False
    is_verified: bool = False


class AgentCreate(AgentBase):
    pass


class AgentUpdate(ORMBaseModel):
    license_number: str | None = None
    agency_name: str | None = None
    service_area: str | None = None
    district_specialization: str | None = None
    mandal_specialization: str | None = None
    village_specialization: str | None = None
    supports_leasing: bool | None = None
    supports_nri: bool | None = None
    is_verified: bool | None = None


class AgentRead(TimestampReadMixin, AgentBase):
    pass


class AgentVerificationUpdate(ORMBaseModel):
    is_verified: bool
