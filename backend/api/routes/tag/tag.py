from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response
from sqlalchemy.orm import Session
from starlette.status import HTTP_200_OK

from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.tag import (
    TAG_MAX_LENGTH,
    TAG_MIN_LENGTH,
    Tag,
    TagAttachToTodo,
    TagCreate,
    TagDelete,
    TagUpdate,
)
from db.schemas.todo_item import TodoItem
from db.utils import tag_crud

router = APIRouter(prefix="/tags", tags=["tags"])
tag_name_validator = Path(min_length=TAG_MIN_LENGTH, max_length=TAG_MAX_LENGTH)


@router.post("/", response_model=Tag)
def create(
    tag: TagCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return tag_crud.create(db, tag, current_user.id)


@router.put(path="/{tag_name}", response_model=Tag)
def update(
    tag_name: Annotated[str, tag_name_validator],
    tag: TagUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return tag_crud.edit(db, tag_name, tag, current_user.id)


@router.post(path="/{tag_name}/todo-items/", response_model=Tag)
def attach_to_todo(
    tag_name: Annotated[str, tag_name_validator],
    association: TagAttachToTodo,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return tag_crud.attach_tag_to_todo(db, tag_name, association, current_user.id)


@router.delete(path="/{tag_name}/todo-items/{todo_id}")
def detach_from_todo(
    tag_name: Annotated[str, tag_name_validator],
    todo_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tag_crud.detach_tag_from_todo(db, tag_name, todo_id, current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.delete(path="/{tag_name}")
def delete(
    tag_name: Annotated[str, tag_name_validator],
    tag: TagDelete,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    tag_crud.delete(db, tag_name, tag, current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.get(path="/", response_model=list[TodoItem])
def search(
    current_user: Annotated[User, Depends(get_current_user)],
    name: Annotated[str, Query()],
    project_id: Annotated[int | None, Query()] = None,
    db: Session = Depends(get_db),
):
    return tag_crud.search(db, project_id, name.strip().lower(), current_user.id)
