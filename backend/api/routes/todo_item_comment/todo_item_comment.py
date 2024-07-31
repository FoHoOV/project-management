from typing import Annotated
from fastapi import APIRouter, Depends, Response
from starlette.status import HTTP_200_OK

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_item_comment import (
    TodoComment,
    TodoCommentCreate,
    TodoCommentUpdate,
)
from db.utils import todo_item_comment_crud


router = APIRouter(prefix="/todo-items", tags=["todo-item-comments"])


@router.post("/{todo_id}/comments", response_model=TodoComment)
def create(
    todo_id: int,
    comment: TodoCommentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    result = todo_item_comment_crud.create(db, todo_id, comment, current_user.id)
    return result


@router.put(path="/{todo_id}/comments/{comment_id}", response_model=TodoComment)
def update(
    todo_id: int,
    comment_id: int,
    comment: TodoCommentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return todo_item_comment_crud.edit(
        db, todo_id, comment_id, comment, current_user.id
    )


@router.delete(path="/{todo_id}/comments/{comment_id}")
def delete(
    todo_id: int,
    comment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    todo_item_comment_crud.delete(db, todo_id, comment_id, current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.get(path="/{todo_id}/comments/", response_model=list[TodoComment])
def list(
    todo_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return todo_item_comment_crud.list(db, todo_id, current_user.id)
