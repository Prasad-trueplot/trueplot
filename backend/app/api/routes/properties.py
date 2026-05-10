from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_admin
from app.crud import agent_crud, property_crud
from app.models.enums import ListingStatus, ListingType, UserRole, VerificationStatus
from app.models.user import User
from app.schemas.property import (
    PropertyCreate,
    PropertyRead,
    PropertyAgentAssignment,
    PropertyStatusUpdate,
    PropertyUpdate,
    PropertyVerificationUpdate,
)

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post(
    "",
    response_model=PropertyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create property listing",
)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN and payload.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sellers can only create properties for their own user account",
        )
    return property_crud.create(db, payload)


@router.get(
    "",
    response_model=list[PropertyRead],
    summary="List property listings",
)
def list_properties(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    listing_status: ListingStatus | None = None,
    verification_status: VerificationStatus | None = None,
    listing_type: ListingType | None = None,
    district: str | None = None,
    mandal: str | None = None,
    village: str | None = None,
    survey_number: str | None = None,
):
    return property_crud.list_filtered(
        db,
        skip=skip,
        limit=limit,
        listing_status=listing_status,
        verification_status=verification_status,
        listing_type=listing_type,
        district=district,
        mandal=mandal,
        village=village,
        survey_number=survey_number,
    )


@router.get(
    "/{property_id}",
    response_model=PropertyRead,
    summary="Get property listing details",
)
def get_property(property_id: UUID, db: Session = Depends(get_db)):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    return property_record


@router.patch(
    "/{property_id}",
    response_model=PropertyRead,
    summary="Update property listing",
)
def update_property(
    property_id: UUID,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    if current_user.role != UserRole.ADMIN and property_record.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner or admin can update this property",
        )

    return property_crud.update(db, property_record, payload)


@router.patch(
    "/{property_id}/status",
    response_model=PropertyRead,
    summary="Update property listing status",
)
def update_property_status(
    property_id: UUID,
    payload: PropertyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    return property_crud.update(
        db,
        property_record,
        {"listing_status": payload.listing_status},
    )


@router.patch(
    "/{property_id}/verification",
    response_model=PropertyRead,
    summary="Update property verification status",
)
def update_property_verification(
    property_id: UUID,
    payload: PropertyVerificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    return property_crud.update(
        db,
        property_record,
        {
            "is_verified": payload.is_verified,
            "verification_status": payload.verification_status,
        },
    )


@router.patch(
    "/{property_id}/agent",
    response_model=PropertyRead,
    summary="Associate or remove an agent from a property",
)
def update_property_agent(
    property_id: UUID,
    payload: PropertyAgentAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    if payload.agent_id is not None:
        agent = agent_crud.get(db, payload.agent_id)
        if agent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found",
            )
        if not agent.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only verified agents can be assigned to a property",
            )

    return property_crud.update(
        db,
        property_record,
        {"assigned_agent_id": payload.agent_id},
    )
