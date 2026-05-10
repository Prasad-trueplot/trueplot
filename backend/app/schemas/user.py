from app.models.enums import UserRole
from app.schemas.base import ORMBaseModel, TimestampReadMixin


class UserBase(ORMBaseModel):
    email: str
    full_name: str
    phone: str | None = None
    role: UserRole = UserRole.BUYER
    is_active: bool = True
    is_verified: bool = False


class UserCreate(UserBase):
    password: str | None = None


class UserUpdate(ORMBaseModel):
    email: str | None = None
    full_name: str | None = None
    phone: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    is_verified: bool | None = None


class UserRead(TimestampReadMixin, UserBase):
    pass


class UserSignup(ORMBaseModel):
    email: str
    full_name: str
    password: str
    phone: str | None = None
    role: UserRole = UserRole.BUYER


class UserLogin(ORMBaseModel):
    email: str
    password: str


class Token(ORMBaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
