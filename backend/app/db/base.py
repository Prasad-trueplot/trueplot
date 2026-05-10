from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models.

    Naming conventions keep generated constraints stable for migrations.
    """

    metadata = MetaData(naming_convention=convention)


# Import models so Base.metadata contains every table for migrations.
from app.models.agent import Agent  # noqa: E402,F401
from app.models.ai_summary import AISummary  # noqa: E402,F401
from app.models.lead import Lead  # noqa: E402,F401
from app.models.lease_listing import LeaseListing  # noqa: E402,F401
from app.models.property import Property  # noqa: E402,F401
from app.models.property_document import PropertyDocument  # noqa: E402,F401
from app.models.user import User  # noqa: E402,F401
