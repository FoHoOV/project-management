from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_item import (
    SearchTodoItemParams,
    TodoItem,
    TodoItemCreate,
    TodoItemUpdate,
    TodoItemDelete,
)
from db.utils import todo_item_crud


router = APIRouter(prefix="/todo-item", tags=["todo-item"])


@router.post("/create", response_model=TodoItem)
def create_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoItemCreate,
    db: Session = Depends(get_db),
):
    return todo_item_crud.create(db=db, todo=todo, user_id=current_user.id)


@router.patch(path="/update", response_model=TodoItem)
def update(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoItemUpdate,
    db: Session = Depends(get_db),
):
    db_items = todo_item_crud.update(db=db, todo=todo, user_id=current_user.id)
    if not db_items:
        raise HTTPException(status_code=404, detail="todo item not found")
    return db_items


@router.delete(path="/remove")
def remove(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoItemDelete,
    db: Session = Depends(get_db),
):
    deleted_rows = todo_item_crud.remove(db=db, todo=todo, user_id=current_user.id)
    if deleted_rows == 0:
        raise HTTPException(status_code=404, detail="todo item not found")


@router.get("/list", response_model=list[TodoItem])
def get_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    search_todo_params: SearchTodoItemParams = Depends(SearchTodoItemParams),
    db: Session = Depends(get_db),
):
    items = todo_item_crud.get_todos_for_user(db, current_user.id, search_todo_params)
    return items
