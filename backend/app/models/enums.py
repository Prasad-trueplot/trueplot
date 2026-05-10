from enum import StrEnum


class VerificationStatus(StrEnum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class ListingStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"


class ListingType(StrEnum):
    SALE = "sale"
    LEASE = "lease"
    SALE_OR_LEASE = "sale_or_lease"


class DocumentStatus(StrEnum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class DocumentType(StrEnum):
    EC = "ec"
    ONE_B = "1b"
    ADANGAL = "adangal"
    SALE_DEED = "sale_deed"
    PATTADAR_PASSBOOK = "pattadar_passbook"
    FMB_MAP = "fmb_map"
    OTHER = "other"


class PropertyType(StrEnum):
    LAND = "land"
    APARTMENT = "apartment"
    HOUSE = "house"
    COMMERCIAL = "commercial"


class LeadStatus(StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    CLOSED = "closed"
    LOST = "lost"


class InterestType(StrEnum):
    BUY = "buy"
    LEASE = "lease"


class AISummaryType(StrEnum):
    PROPERTY = "property"
    DOCUMENT = "document"
    LEAD = "lead"


class UserRole(StrEnum):
    ADMIN = "admin"
    SELLER = "seller"
    BUYER = "buyer"
    VERIFIED_AGENT = "verified_agent"
