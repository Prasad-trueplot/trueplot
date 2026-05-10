from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import property_crud, property_pricing_estimate_crud
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.property_pricing_estimate import (
    PropertyPricingEstimateCreate,
    PropertyPricingEstimateGenerateRequest,
    PropertyPricingEstimateRead,
)
from app.services.pricing_service import generate_pricing_estimate

router = APIRouter(tags=["pricing"])


@router.post(
    "/properties/{property_id}/pricing-estimate",
    response_model=PropertyPricingEstimateRead,
    status_code=status.HTTP_201_CREATED,
    summary="Generate an AI-assisted pricing estimate for a property",
)
def generate_property_pricing_estimate(
    property_id: UUID,
    payload: PropertyPricingEstimateGenerateRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    allowed_agent = (
        property_record.assigned_agent_id is not None
        and getattr(current_user, "agent_profile", None) is not None
        and current_user.agent_profile.id == property_record.assigned_agent_id
    )
    if (
        current_user.role != UserRole.ADMIN
        and property_record.owner_id != current_user.id
        and not allowed_agent
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner, assigned agent, or admin can generate pricing estimates",
        )

    result = generate_pricing_estimate(property_record)
    summary_in = PropertyPricingEstimateCreate(
        property_id=property_record.id,
        created_by_user_id=(
            payload.created_by_user_id
            if payload and payload.created_by_user_id is not None
            else current_user.id
        ),
        listing_type=property_record.listing_type,
        pricing_basis=result.pricing_basis,
        content=result.content,
        estimated_low_amount=result.estimated_low_amount,
        estimated_high_amount=result.estimated_high_amount,
        currency=result.currency,
        confidence_score=result.confidence_score,
        pricing_factors=result.pricing_factors,
        district_influence=result.district_influence,
        mandal_influence=result.mandal_influence,
        village_influence=result.village_influence,
        road_highway_proximity=result.road_highway_proximity,
        market_notes=result.market_notes,
        disclaimer=result.disclaimer,
        model_name=result.model_name,
        is_mock=result.is_mock,
    )

    return property_pricing_estimate_crud.create(db, summary_in)


@router.get(
    "/properties/{property_id}/pricing-estimates",
    response_model=list[PropertyPricingEstimateRead],
    summary="List pricing estimates for a property",
)
def list_property_pricing_estimates(
    property_id: UUID,
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    return property_pricing_estimate_crud.list_by_property(
        db,
        property_id=property_id,
        skip=skip,
        limit=limit,
    )
