import builtins
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.project import (
    PartialUserWithPermission,
    Project,
    ProjectUpdateUserPermissions,
)
from db.utils import project_crud

router = APIRouter(prefix="/permissions", tags=["permissions"])


@router.put(path="/{project_id}", response_model=PartialUserWithPermission)
def update(
    project_id: int,
    permissions: ProjectUpdateUserPermissions,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    updated_project = project_crud.update_user_permissions(
        db, project_id, permissions, current_user.id
    )

    user = builtins.list(
        filter(
            lambda user: user.id == permissions.user_id,
            Project.model_validate(updated_project).users,
        )
    )[0]

    return user
