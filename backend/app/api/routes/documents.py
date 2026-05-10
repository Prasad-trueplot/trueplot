from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import property_crud, property_document_crud
from app.models.enums import DocumentStatus, DocumentType
from app.schemas.property_document import (
    PropertyDocumentCreate,
    PropertyDocumentRead,
    PropertyDocumentReviewUpdate,
)
from app.services.storage import save_upload_file

router = APIRouter(tags=["documents"])


@router.post(
    "/properties/{property_id}/documents",
    response_model=PropertyDocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document for a property",
)
async def upload_property_document(
    property_id: UUID,
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    uploaded_by_user_id: UUID | None = Form(default=None),
    notes: str | None = Form(default=None),
    db: Session = Depends(get_db),
):
    property_record = property_crud.get(db, property_id)
    if property_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    stored_file = await save_upload_file(file)
    document = PropertyDocumentCreate(
        property_id=property_id,
        uploaded_by_user_id=uploaded_by_user_id,
        document_type=document_type,
        file_name=stored_file.original_filename,
        original_filename=stored_file.original_filename,
        stored_filename=stored_file.stored_filename,
        content_type=stored_file.content_type,
        file_size_bytes=stored_file.file_size_bytes,
        file_url=stored_file.relative_path,
        status=DocumentStatus.PENDING,
        is_verified=False,
        notes=notes,
    )

    return property_document_crud.create(db, document)


@router.get(
    "/properties/{property_id}/documents",
    response_model=list[PropertyDocumentRead],
    summary="List documents for a property",
)
def list_property_documents(
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

    return property_document_crud.list_by_property(
        db, property_id=property_id, skip=skip, limit=limit
    )


@router.get(
    "/documents/{document_id}",
    response_model=PropertyDocumentRead,
    summary="Get document details",
)
def get_document(document_id: UUID, db: Session = Depends(get_db)):
    document = property_document_crud.get(db, document_id)
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return document


@router.patch(
    "/documents/{document_id}/review",
    response_model=PropertyDocumentRead,
    summary="Update document review status",
)
def update_document_review(
    document_id: UUID,
    payload: PropertyDocumentReviewUpdate,
    db: Session = Depends(get_db),
):
    document = property_document_crud.get(db, document_id)
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return property_document_crud.update(
        db,
        document,
        {
            "status": payload.status,
            "is_verified": payload.is_verified,
            "admin_review_notes": payload.admin_review_notes,
        },
    )

