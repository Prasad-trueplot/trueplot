from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_admin
from app.crud import agent_crud
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.agent import (
    AgentCreate,
    AgentRead,
    AgentUpdate,
    AgentVerificationUpdate,
)

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post(
    "",
    response_model=AgentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create verified agent profile",
)
def create_agent(
    payload: AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN and payload.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agents can only create their own profile",
        )
    return agent_crud.create(db, payload)


@router.get("", response_model=list[AgentRead], summary="List agents")
def list_agents(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    verified_only: bool = False,
):
    if verified_only:
        return agent_crud.list_verified(db, skip=skip, limit=limit)
    return agent_crud.list(db, skip=skip, limit=limit)


@router.get("/{agent_id}", response_model=AgentRead, summary="Get agent details")
def get_agent(agent_id: UUID, db: Session = Depends(get_db)):
    agent = agent_crud.get(db, agent_id)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return agent


@router.patch("/{agent_id}", response_model=AgentRead, summary="Update agent profile")
def update_agent(
    agent_id: UUID,
    payload: AgentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = agent_crud.get(db, agent_id)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    if current_user.role != UserRole.ADMIN and agent.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the agent owner or admin can update this profile",
        )
    return agent_crud.update(db, agent, payload)


@router.patch(
    "/{agent_id}/verification",
    response_model=AgentRead,
    summary="Update agent verification status",
)
def update_agent_verification(
    agent_id: UUID,
    payload: AgentVerificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    agent = agent_crud.get(db, agent_id)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return agent_crud.update(db, agent, {"is_verified": payload.is_verified})
