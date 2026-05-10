from app.crud.base import CRUDBase
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


class CRUDAgent(CRUDBase[Agent, AgentCreate, AgentUpdate]):
    def list_verified(self, db: Session, skip: int = 0, limit: int = 100) -> list[Agent]:
        statement = select(Agent).where(Agent.is_verified.is_(True)).offset(skip).limit(limit)
        return list(db.scalars(statement).all())


agent_crud = CRUDAgent(Agent)
