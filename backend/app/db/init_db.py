from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import all_models  # noqa: F401
from app.db.base import Base
from app.db.session import engine


def create_database_tables() -> None:
    """Create tables for local development.

    Production and shared environments should use migrations instead.
    """

    Base.metadata.create_all(bind=engine)
    ensure_local_property_schema()


def ensure_local_property_schema() -> None:
    """Apply idempotent local-only schema additions before Alembic is introduced."""

    statements = [
        """
        DO $$
        BEGIN
            CREATE TYPE listing_type AS ENUM ('SALE', 'LEASE', 'SALE_OR_LEASE');
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END $$;
        """,
        """
        ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS listing_type listing_type NOT NULL DEFAULT 'SALE'
        """,
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude double precision",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude double precision",
        """
        DO $$
        BEGIN
            CREATE TYPE document_type AS ENUM (
                'EC',
                'ONE_B',
                'ADANGAL',
                'SALE_DEED',
                'PATTADAR_PASSBOOK',
                'FMB_MAP',
                'OTHER'
            );
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END $$;
        """,
        """
        ALTER TABLE property_documents
        ADD COLUMN IF NOT EXISTS original_filename varchar(255)
        """,
        """
        ALTER TABLE property_documents
        ADD COLUMN IF NOT EXISTS stored_filename varchar(255)
        """,
        """
        ALTER TABLE property_documents
        ADD COLUMN IF NOT EXISTS content_type varchar(120)
        """,
        """
        ALTER TABLE property_documents
        ADD COLUMN IF NOT EXISTS file_size_bytes bigint
        """,
        """
        ALTER TABLE property_documents
        ADD COLUMN IF NOT EXISTS admin_review_notes text
        """,
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'property_documents'
                  AND column_name = 'document_type'
                  AND udt_name <> 'document_type'
            ) THEN
                UPDATE property_documents
                SET document_type = CASE document_type
                    WHEN 'ec' THEN 'EC'
                    WHEN '1b' THEN 'ONE_B'
                    WHEN 'adangal' THEN 'ADANGAL'
                    WHEN 'sale_deed' THEN 'SALE_DEED'
                    WHEN 'pattadar_passbook' THEN 'PATTADAR_PASSBOOK'
                    WHEN 'fmb_map' THEN 'FMB_MAP'
                    ELSE 'OTHER'
                END;

                ALTER TABLE property_documents
                ALTER COLUMN document_type TYPE document_type
                USING document_type::document_type;
            END IF;

            ALTER TABLE property_documents
            ALTER COLUMN document_type SET DEFAULT 'OTHER';
        END $$;
        """,
        """
        ALTER TABLE ai_summaries
        ADD COLUMN IF NOT EXISTS document_id uuid REFERENCES property_documents(id)
        """,
        "ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS english_summary text",
        "ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS telugu_summary text",
        "ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS ownership_summary text",
        "ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS document_insights text",
        "ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS risk_flags text",
        """
        ALTER TABLE ai_summaries
        ADD COLUMN IF NOT EXISTS recommended_next_steps text
        """,
        "ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS disclaimer text",
        """
        ALTER TABLE ai_summaries
        ADD COLUMN IF NOT EXISTS is_mock boolean NOT NULL DEFAULT true
        """,
        "ALTER TABLE agents ADD COLUMN IF NOT EXISTS district_specialization varchar(255)",
        "ALTER TABLE agents ADD COLUMN IF NOT EXISTS mandal_specialization varchar(255)",
        "ALTER TABLE agents ADD COLUMN IF NOT EXISTS village_specialization varchar(255)",
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS supports_leasing boolean NOT NULL DEFAULT false
        """,
        """
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS supports_nri boolean NOT NULL DEFAULT false
        """,
        """
        DO $$
        BEGIN
            CREATE TYPE user_role AS ENUM ('ADMIN', 'SELLER', 'BUYER', 'VERIFIED_AGENT');
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END $$;
        """,
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password varchar(255)",
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'BUYER'
        """,
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def ping_database(db: Session) -> bool:
    return db.is_active
