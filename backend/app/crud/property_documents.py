from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.property_document import PropertyDocument
from app.schemas.property_document import PropertyDocumentCreate, PropertyDocumentUpdate


class CRUDPropertyDocument(
    CRUDBase[PropertyDocument, PropertyDocumentCreate, PropertyDocumentUpdate]
):
    def list_by_property(
        self, db: Session, property_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[PropertyDocument]:
        statement = (
            select(PropertyDocument)
            .where(PropertyDocument.property_id == property_id)
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())


property_document_crud = CRUDPropertyDocument(PropertyDocument)

