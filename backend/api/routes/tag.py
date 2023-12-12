from typing import Annotated
from fastapi import APIRouter, Depends, Response
from starlette.status import HTTP_200_OK

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.tag import (
    TagAttachToTodo,
    TagDetachFromTodo,
    TagDelete,
    TagCreate,
    TagUpdate,
    TagSearch,
    Tag,
)
from db.utils import tag_crud


router = APIRouter(prefix="/tag", tags=["tag"])


@router.post("/create", response_model=Tag)
def create(
    current_user: Annotated[User, Depends(get_current_user)],
    tag: TagCreate,
    db: Session = Depends(get_db),
):
    return tag_crud.create(db=db, tag=tag, user_id=current_user.id)


@router.patch(path="/update", response_model=Tag)
def update(
    current_user: Annotated[User, Depends(get_current_user)],
    tag: TagUpdate,
    db: Session = Depends(get_db),
):
    return tag_crud.edit(db=db, tag=tag, user_id=current_user.id)


@router.post(path="/attach-to-todo", response_model=TagAttachToTodo)
def attach_to_todo(
    current_user: Annotated[User, Depends(get_current_user)],
    association: TagAttachToTodo,
    db: Session = Depends(get_db),
):
    return tag_crud.attach_tag_to_todo(
        db=db, association=association, user_id=current_user.id
    )


@router.delete(path="/detach-from-todo")
def detach_from_todo(
    current_user: Annotated[User, Depends(get_current_user)],
    association: TagDetachFromTodo,
    db: Session = Depends(get_db),
):
    tag_crud.detach_tag_from_todo(
        db=db, association=association, user_id=current_user.id
    )
    return Response(status_code=HTTP_200_OK)


@router.delete(path="/delete")
def delete(
    current_user: Annotated[User, Depends(get_current_user)],
    tag: TagDelete,
    db: Session = Depends(get_db),
):
    tag_crud.delete(db=db, tag=tag, user_id=current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.get(path="/list", response_model=list[Tag])
def list(
    current_user: Annotated[User, Depends(get_current_user)],
    search: TagSearch = Depends(TagSearch),
    db: Session = Depends(get_db),
):
    return tag_crud.search(db=db, search=search, user_id=current_user.id)
