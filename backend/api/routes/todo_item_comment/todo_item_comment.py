from typing import Annotated
from fastapi import APIRouter, Depends, Response
from starlette.status import HTTP_200_OK

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_item_comment import (
    TodoComment,
    TodoCommentBase,
    TodoCommentCreate,
    TodoCommentDelete,
    TodoCommentSearch,
    TodoCommentUpdate,
)
from db.utils import todo_item_comment_crud


router = APIRouter(prefix="/todo-item/comment", tags=["todo-item-comment"])


@router.post("/create", response_model=TodoComment)
def create(
    current_user: Annotated[User, Depends(get_current_user)],
    comment: TodoCommentCreate,
    db: Session = Depends(get_db),
):
    result = todo_item_comment_crud.create(
        db=db, comment=comment, user_id=current_user.id
    )
    return result


@router.patch(path="/update", response_model=TodoComment)
def update(
    current_user: Annotated[User, Depends(get_current_user)],
    comment: TodoCommentUpdate,
    db: Session = Depends(get_db),
):
    return todo_item_comment_crud.edit(db=db, comment=comment, user_id=current_user.id)


@router.delete(path="/delete")
def delete(
    current_user: Annotated[User, Depends(get_current_user)],
    comment: TodoCommentDelete,
    db: Session = Depends(get_db),
):
    todo_item_comment_crud.delete(db=db, comment=comment, user_id=current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.get(path="/list", response_model=list[TodoComment])
def list(
    current_user: Annotated[User, Depends(get_current_user)],
    search: TodoCommentSearch = Depends(TodoCommentSearch),
    db: Session = Depends(get_db),
):
    return todo_item_comment_crud.list(db=db, search=search, user_id=current_user.id)
