from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate


class CRUDLead(CRUDBase[Lead, LeadCreate, LeadUpdate]):
    def list_by_property(
        self, db: Session, property_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[Lead]:
        statement = (
            select(Lead).where(Lead.property_id == property_id).offset(skip).limit(limit)
        )
        return list(db.scalars(statement).all())


lead_crud = CRUDLead(Lead)

