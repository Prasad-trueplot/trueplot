from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.ai_summary import AISummary
from app.schemas.ai_summary import AISummaryCreate, AISummaryUpdate


class CRUDAISummary(CRUDBase[AISummary, AISummaryCreate, AISummaryUpdate]):
    def list_by_property(
        self, db: Session, property_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[AISummary]:
        statement = (
            select(AISummary)
            .where(AISummary.property_id == property_id)
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    def list_by_document(
        self, db: Session, document_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[AISummary]:
        statement = (
            select(AISummary)
            .where(AISummary.document_id == document_id)
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())


ai_summary_crud = CRUDAISummary(AISummary)
