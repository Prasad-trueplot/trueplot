from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.enums import ListingStatus, ListingType, VerificationStatus
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate


class CRUDProperty(CRUDBase[Property, PropertyCreate, PropertyUpdate]):
    def list_filtered(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        listing_status: ListingStatus | None = None,
        verification_status: VerificationStatus | None = None,
        listing_type: ListingType | None = None,
        district: str | None = None,
        mandal: str | None = None,
        village: str | None = None,
        survey_number: str | None = None,
    ) -> list[Property]:
        statement = select(Property)

        if listing_status is not None:
            statement = statement.where(Property.listing_status == listing_status)
        if verification_status is not None:
            statement = statement.where(
                Property.verification_status == verification_status
            )
        if listing_type is not None:
            statement = statement.where(Property.listing_type == listing_type)
        if district is not None:
            statement = statement.where(Property.district == district)
        if mandal is not None:
            statement = statement.where(Property.mandal == mandal)
        if village is not None:
            statement = statement.where(Property.village == village)
        if survey_number is not None:
            statement = statement.where(Property.survey_number == survey_number)

        statement = statement.order_by(Property.created_at.desc()).offset(skip).limit(limit)
        return list(db.scalars(statement).all())

    def list_by_owner(
        self, db: Session, owner_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[Property]:
        statement = (
            select(Property)
            .where(Property.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())


property_crud = CRUDProperty(Property)
