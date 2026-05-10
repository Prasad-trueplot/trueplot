from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.lease_listing import LeaseListing
from app.schemas.lease_listing import LeaseListingCreate, LeaseListingUpdate


class CRUDLeaseListing(CRUDBase[LeaseListing, LeaseListingCreate, LeaseListingUpdate]):
    def list_by_property(
        self, db: Session, property_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[LeaseListing]:
        statement = (
            select(LeaseListing)
            .where(LeaseListing.property_id == property_id)
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())


lease_listing_crud = CRUDLeaseListing(LeaseListing)

