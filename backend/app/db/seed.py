from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud import (
    agent_crud,
    ai_summary_crud,
    lead_crud,
    lease_listing_crud,
    property_crud,
    property_document_crud,
    user_crud,
)
from app.models.agent import Agent
from app.models.ai_summary import AISummary
from app.models.enums import (
    AISummaryType,
    DocumentStatus,
    DocumentType,
    InterestType,
    ListingStatus,
    ListingType,
    PropertyType,
    UserRole,
    VerificationStatus,
)
from app.models.property import Property
from app.models.property_document import PropertyDocument
from app.schemas import (
    AISummaryCreate,
    AgentCreate,
    LeadCreate,
    LeaseListingCreate,
    PropertyCreate,
    PropertyDocumentCreate,
    UserCreate,
)


def seed_sample_data(db: Session) -> None:
    admin = _get_or_create_user(
        db,
        email="admin@trueplot.local",
        full_name="TRUEPLOT Admin",
        phone="+919000000000",
        role=UserRole.ADMIN,
    )
    owner = _get_or_create_user(
        db,
        email="owner@example.com",
        full_name="Sample Land Owner",
        phone="+919000000001",
        role=UserRole.SELLER,
    )
    lease_owner = _get_or_create_user(
        db,
        email="lease-owner@example.com",
        full_name="Sample Lease Owner",
        phone="+919000000004",
        role=UserRole.SELLER,
    )
    review_owner = _get_or_create_user(
        db,
        email="review-owner@example.com",
        full_name="Sample Review Owner",
        phone="+919000000005",
        role=UserRole.SELLER,
    )
    agent_user = _get_or_create_user(
        db,
        email="agent@example.com",
        full_name="Sample Verified Agent",
        phone="+919000000002",
        role=UserRole.VERIFIED_AGENT,
    )
    _get_or_create_user(
        db,
        email="buyer@example.com",
        full_name="Sample Buyer",
        phone="+919000000006",
        role=UserRole.BUYER,
    )
    agent = _get_or_create_agent(db, agent_user.id)

    verified_land = _get_or_create_property(
        db,
        PropertyCreate(
            owner_id=owner.id,
            assigned_agent_id=agent.id,
            title="Verified Amaravati land parcel",
            description="Active sale-or-lease listing with approved deed and AI summary.",
            property_type=PropertyType.LAND,
            listing_type=ListingType.SALE_OR_LEASE,
            village="Tadepalli",
            mandal="Tadepalli",
            district="Guntur",
            survey_number="123/4A",
            latitude=16.4777,
            longitude=80.6186,
            extent_sq_yards=Decimal("2400.00"),
            is_verified=True,
            verification_status=VerificationStatus.VERIFIED,
            listing_status=ListingStatus.ACTIVE,
        ),
    )
    lease_land = _get_or_create_property(
        db,
        PropertyCreate(
            owner_id=lease_owner.id,
            assigned_agent_id=agent.id,
            title="Vijayawada commercial lease site",
            description="Lease-focused property for recurring rent workflow demos.",
            property_type=PropertyType.COMMERCIAL,
            listing_type=ListingType.LEASE,
            address_line="Near Benz Circle",
            village="Patamata",
            mandal="Vijayawada Urban",
            district="NTR",
            survey_number="88/2B",
            latitude=16.5062,
            longitude=80.648,
            extent_sq_yards=Decimal("900.00"),
            is_verified=False,
            verification_status=VerificationStatus.PENDING,
            listing_status=ListingStatus.ACTIVE,
        ),
    )
    review_land = _get_or_create_property(
        db,
        PropertyCreate(
            owner_id=review_owner.id,
            assigned_agent_id=agent.id,
            title="Visakhapatnam pending review plot",
            description="Draft listing for admin approval and verification demo.",
            property_type=PropertyType.LAND,
            listing_type=ListingType.SALE,
            village="Madhurawada",
            mandal="Visakhapatnam Rural",
            district="Visakhapatnam",
            survey_number="45/7C",
            latitude=17.8196,
            longitude=83.3566,
            extent_sq_yards=Decimal("1800.00"),
            is_verified=False,
            verification_status=VerificationStatus.PENDING,
            listing_status=ListingStatus.DRAFT,
        ),
    )

    _get_or_create_document(
        db,
        property_record=verified_land,
        owner_id=owner.id,
        document_type=DocumentType.SALE_DEED,
        file_name="amaravati-sale-deed.pdf",
        status=DocumentStatus.APPROVED,
        is_verified=True,
        admin_review_notes="Sale deed reviewed for local MVP sample.",
    )
    _get_or_create_document(
        db,
        property_record=verified_land,
        owner_id=owner.id,
        document_type=DocumentType.EC,
        file_name="amaravati-ec.pdf",
        status=DocumentStatus.UNDER_REVIEW,
        is_verified=False,
        admin_review_notes="Encumbrance chain pending manual confirmation.",
    )
    _get_or_create_document(
        db,
        property_record=lease_land,
        owner_id=lease_owner.id,
        document_type=DocumentType.FMB_MAP,
        file_name="vijayawada-fmb-map.pdf",
        status=DocumentStatus.PENDING,
        is_verified=False,
    )
    _get_or_create_document(
        db,
        property_record=review_land,
        owner_id=review_owner.id,
        document_type=DocumentType.ADANGAL,
        file_name="visakhapatnam-adangal.pdf",
        status=DocumentStatus.PENDING,
        is_verified=False,
    )

    _get_or_create_lease_listing(db, lease_land)
    _get_or_create_lead(db, verified_land, agent)
    _get_or_create_lead(db, lease_land, agent, interest_type=InterestType.LEASE)
    _get_or_create_ai_summary(db, verified_land, agent_user.id)


def _get_or_create_user(
    db: Session,
    *,
    email: str,
    full_name: str,
    phone: str,
    role: UserRole,
):
    user = user_crud.get_by_email(db, email)
    if user is not None:
        user_crud.update(
            db,
            user,
            {
                "role": role,
                "is_active": True,
                "is_verified": True,
                "hashed_password": _demo_password_hash(),
            },
        )
        return user

    return user_crud.create(
        db,
        UserCreate(
            email=email,
            full_name=full_name,
            phone=phone,
            role=role,
            password="trueplot123",
            is_verified=True,
        ),
    )


def _demo_password_hash() -> str:
    from app.core.security import hash_password

    return hash_password("trueplot123")


def _get_or_create_agent(db: Session, user_id):
    agent = db.scalar(select(Agent).where(Agent.license_number == "AP-AGENT-001"))
    if agent is not None:
        agent_crud.update(
            db,
            agent,
            {
                "agency_name": "TRUEPLOT Sample Realty",
                "service_area": "Vijayawada, Guntur, Visakhapatnam",
                "district_specialization": "Guntur, NTR, Visakhapatnam",
                "mandal_specialization": "Tadepalli, Vijayawada Urban, Visakhapatnam Rural",
                "village_specialization": "Tadepalli, Patamata, Madhurawada",
                "supports_leasing": True,
                "supports_nri": True,
                "is_verified": True,
            },
        )
        return agent

    return agent_crud.create(
        db,
        AgentCreate(
            user_id=user_id,
            license_number="AP-AGENT-001",
            agency_name="TRUEPLOT Sample Realty",
            service_area="Vijayawada, Guntur, Visakhapatnam",
            district_specialization="Guntur, NTR, Visakhapatnam",
            mandal_specialization="Tadepalli, Vijayawada Urban, Visakhapatnam Rural",
            village_specialization="Tadepalli, Patamata, Madhurawada",
            supports_leasing=True,
            supports_nri=True,
            is_verified=True,
        ),
    )


def _get_or_create_property(db: Session, payload: PropertyCreate):
    property_record = db.scalar(
        select(Property).where(Property.survey_number == payload.survey_number)
    )
    if property_record is not None:
        return property_record

    return property_crud.create(db, payload)


def _get_or_create_document(
    db: Session,
    *,
    property_record: Property,
    owner_id,
    document_type: DocumentType,
    file_name: str,
    status: DocumentStatus,
    is_verified: bool,
    admin_review_notes: str | None = None,
):
    document = db.scalar(
        select(PropertyDocument).where(
            PropertyDocument.property_id == property_record.id,
            PropertyDocument.file_name == file_name,
        )
    )
    if document is not None:
        return document

    return property_document_crud.create(
        db,
        PropertyDocumentCreate(
            property_id=property_record.id,
            uploaded_by_user_id=owner_id,
            document_type=document_type,
            file_name=file_name,
            original_filename=file_name,
            stored_filename=file_name,
            content_type="application/pdf",
            file_size_bytes=0,
            file_url=f"uploads/{file_name}",
            status=status,
            is_verified=is_verified,
            admin_review_notes=admin_review_notes,
        ),
    )


def _get_or_create_lease_listing(db: Session, property_record: Property) -> None:
    if property_record.lease_listings:
        return

    lease_listing_crud.create(
        db,
        LeaseListingCreate(
            property_id=property_record.id,
            monthly_rent=Decimal("85000.00"),
            security_deposit=Decimal("170000.00"),
            lease_term_months=36,
            status=ListingStatus.ACTIVE,
            terms="Sample lease terms for local founder demo.",
        ),
    )


def _get_or_create_lead(
    db: Session,
    property_record: Property,
    agent: Agent,
    interest_type: InterestType = InterestType.BUY,
) -> None:
    if property_record.leads:
        return

    lead_crud.create(
        db,
        LeadCreate(
            property_id=property_record.id,
            agent_id=agent.id,
            contact_name="Sample Buyer" if interest_type == InterestType.BUY else "Sample Lessee",
            contact_phone="+919000000003",
            interest_type=interest_type,
            notes="Sample local MVP lead.",
        ),
    )


def _get_or_create_ai_summary(db: Session, property_record: Property, agent_user_id) -> None:
    existing = db.scalar(
        select(AISummary).where(
            AISummary.property_id == property_record.id,
            AISummary.summary_type == AISummaryType.PROPERTY,
            AISummary.model_name == "local-placeholder",
        )
    )
    if existing is not None:
        return

    ai_summary_crud.create(
        db,
        AISummaryCreate(
            property_id=property_record.id,
            created_by_user_id=agent_user_id,
            summary_type=AISummaryType.PROPERTY,
            content="Sample AI-assisted summary placeholder for a verified AP land parcel.",
            english_summary="Verified sample parcel with sale deed and EC records available for review.",
            telugu_summary="నమూనా ధృవీకరించిన భూమి రికార్డు. మానవ సమీక్ష అవసరం.",
            ownership_summary="Ownership indicators should be checked against sale deed, EC, and revenue records.",
            document_insights="Seeded sample document metadata only; no OCR has been performed.",
            risk_flags="Confirm EC chain and survey boundaries before transaction decisions.",
            recommended_next_steps="Review uploaded documents and obtain legal verification.",
            disclaimer="AI-assisted summary for preliminary review only. This is not final legal advice.",
            model_name="local-placeholder",
            is_mock=True,
            is_verified=False,
        ),
    )
