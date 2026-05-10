from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(30), unique=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    properties = relationship("Property", back_populates="owner")
    agent_profile = relationship("Agent", back_populates="user", uselist=False)
    leads = relationship("Lead", back_populates="user")
    uploaded_documents = relationship("PropertyDocument", back_populates="uploaded_by")
    ai_summaries = relationship("AISummary", back_populates="created_by")

