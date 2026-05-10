from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import ai_summary_crud, property_crud, property_document_crud
from app.models.enums import AISummaryType
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.ai_summary import (
    AISummaryCreate,
    AISummaryGenerateRequest,
    AISummaryRead,
)
from app.services.ai_service import generate_legal_summary

router = APIRouter(tags=["ai-summaries"])


@router.post(
    "/documents/{document_id}/ai-summary",
    response_model=AISummaryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI-assisted legal summary for an uploaded document",
)
def generate_document_ai_summary(
    document_id: UUID,
    payload: AISummaryGenerateRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = property_document_crud.get(db, document_id)
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    property_record = property_crud.get(db, document.property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Linked property not found",
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
            detail="Only the owner, assigned agent, or admin can generate summaries",
        )

    result = generate_legal_summary(document=document, property_record=property_record)
    summary_in = AISummaryCreate(
        property_id=document.property_id,
        document_id=document.id,
        created_by_user_id=payload.created_by_user_id if payload else current_user.id,
        summary_type=AISummaryType.DOCUMENT,
        content=result.content,
        english_summary=result.english_summary,
        telugu_summary=result.telugu_summary,
        ownership_summary=result.ownership_summary,
        document_insights=result.document_insights,
        risk_flags=result.risk_flags,
        recommended_next_steps=result.recommended_next_steps,
        disclaimer=result.disclaimer,
        model_name=result.model_name,
        is_mock=result.is_mock,
        is_verified=False,
    )

    return ai_summary_crud.create(db, summary_in)


@router.get(
    "/properties/{property_id}/ai-summaries",
    response_model=list[AISummaryRead],
    summary="List AI summaries for a property",
)
def list_property_ai_summaries(
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

    return ai_summary_crud.list_by_property(
        db,
        property_id=property_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/ai-summaries/{summary_id}",
    response_model=AISummaryRead,
    summary="Get AI summary details",
)
def get_ai_summary(summary_id: UUID, db: Session = Depends(get_db)):
    summary = ai_summary_crud.get(db, summary_id)
    if summary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI summary not found",
        )

    return summary
