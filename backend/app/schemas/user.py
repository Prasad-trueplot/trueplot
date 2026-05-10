from app.schemas.base import ORMBaseModel, TimestampReadMixin


class UserBase(ORMBaseModel):
    email: str
    full_name: str
    phone: str | None = None
    is_active: bool = True
    is_verified: bool = False


class UserCreate(UserBase):
    pass


class UserUpdate(ORMBaseModel):
    email: str | None = None
    full_name: str | None = None
    phone: str | None = None
    is_active: bool | None = None
    is_verified: bool | None = None


class UserRead(TimestampReadMixin, UserBase):
    pass

