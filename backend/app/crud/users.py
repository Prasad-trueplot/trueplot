from app.crud.base import CRUDBase
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return db.scalar(statement)

    def create(self, db: Session, obj_in: UserCreate) -> User:
        create_data = obj_in.model_dump(exclude={"password"})
        if obj_in.password:
            create_data["hashed_password"] = hash_password(obj_in.password)
        db_obj = User(**create_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


user_crud = CRUDUser(User)
