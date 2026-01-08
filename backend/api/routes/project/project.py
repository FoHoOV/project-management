from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from starlette.status import HTTP_200_OK

from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.project import (
    Project,
    ProjectAttachAssociation,
    ProjectAttachAssociationResponse,
    ProjectCreate,
    ProjectUpdate,
)
from db.utils import project_crud

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=Project)
def create_for_user(
    project: ProjectCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return project_crud.create(db=db, project=project, user_id=current_user.id)


@router.patch(path="/{project_id}", response_model=Project)
def update(
    project_id: int,
    patch: ProjectUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return project_crud.update(db, project_id, patch, current_user.id)


@router.post(
    path="/{project_id}/users", response_model=ProjectAttachAssociationResponse
)
def attach_to_user(
    project_id: int,
    association: ProjectAttachAssociation,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return project_crud.attach_to_user(db, project_id, association, current_user.id)


@router.delete(path="/{project_id}/users/me")
def detach_from_self(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    project_crud.detach_from_user(db, project_id, current_user.id, current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.delete(path="/{project_id}/users/{user_id}")
def detach_from_user(
    project_id: int,
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    project_crud.detach_from_user(db, project_id, user_id, current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.get("/{project_id}", response_model=Project)
def filter(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    project = project_crud.get_project(db, project_id, current_user.id)
    return project


@router.get("/", response_model=list[Project])
def list(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    projects = project_crud.get_projects(db, current_user.id)
    return projects
