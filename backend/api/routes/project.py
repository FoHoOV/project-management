from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.project import (
    Project,
    ProjectCreate,
    ProjectAssociationDelete,
    ProjectRead,
    ProjectAddUser,
)
from db.utils import project_crud


router = APIRouter(prefix="/project", tags=["project"])


@router.post("/create", response_model=Project)
def create_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    project: ProjectCreate,
    db: Session = Depends(get_db),
):
    return project_crud.create(db=db, project=project, user_id=current_user.id)


@router.patch(path="/add-user-association")
def update(
    current_user: Annotated[User, Depends(get_current_user)],
    association: ProjectAddUser,
    db: Session = Depends(get_db),
):
    project_crud.add_association_to_user(db, association, current_user.id)


@router.delete(path="/remove-user-association")
def remove_project_to_user_association(
    current_user: Annotated[User, Depends(get_current_user)],
    association: ProjectAssociationDelete,
    db: Session = Depends(get_db),
):
    project_crud.remove_project_to_user_association(db, association, current_user.id)


@router.get("/search", response_model=Project)
def get_project(
    current_user: Annotated[User, Depends(get_current_user)],
    filter: ProjectRead = Depends(dependency=ProjectRead),
    db: Session = Depends(get_db),
):
    items = project_crud.get_project(db, filter, current_user.id)
    return items


@router.get("/list", response_model=list[Project])
def list(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    projects = project_crud.get_projects(db, current_user.id)
    return projects
