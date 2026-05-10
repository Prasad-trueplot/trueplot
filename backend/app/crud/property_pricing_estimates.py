from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.property_pricing_estimate import PropertyPricingEstimate
from app.schemas.property_pricing_estimate import (
    PropertyPricingEstimateCreate,
    PropertyPricingEstimateUpdate,
)


class CRUDPropertyPricingEstimate(
    CRUDBase[
        PropertyPricingEstimate,
        PropertyPricingEstimateCreate,
        PropertyPricingEstimateUpdate,
    ]
):
    def list_by_property(
        self, db: Session, property_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[PropertyPricingEstimate]:
        statement = (
            select(PropertyPricingEstimate)
            .where(PropertyPricingEstimate.property_id == property_id)
            .order_by(PropertyPricingEstimate.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    def get_latest_by_property(
        self, db: Session, property_id: UUID
    ) -> PropertyPricingEstimate | None:
        statement = (
            select(PropertyPricingEstimate)
            .where(PropertyPricingEstimate.property_id == property_id)
            .order_by(PropertyPricingEstimate.created_at.desc())
            .limit(1)
        )
        return db.scalars(statement).first()


property_pricing_estimate_crud = CRUDPropertyPricingEstimate(
    PropertyPricingEstimate
)
