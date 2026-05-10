"""Import all SQLAlchemy models for metadata creation."""

from app.models.agent import Agent  # noqa: F401
from app.models.ai_summary import AISummary  # noqa: F401
from app.models.lead import Lead  # noqa: F401
from app.models.lease_listing import LeaseListing  # noqa: F401
from app.models.property import Property  # noqa: F401
from app.models.property_document import PropertyDocument  # noqa: F401
from app.models.user import User  # noqa: F401
