from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo import SearchTodoParams, Todo, TodoCreate
from db.utils import todo_crud


router = APIRouter(prefix="/todo", tags=["todo"])


@router.post("/create", response_model=Todo)
def create_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoCreate,
    db: Session = Depends(get_db),
):
    return todo_crud.create_todo(db=db, todo=todo, user_id=current_user.id)


@router.patch(path="/update", response_model=Todo)
def update(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: Todo,
    db: Session = Depends(get_db),
):
    db_items = todo_crud.update(db=db, todo=todo, user_id=current_user.id)
    if not db_items:
        raise HTTPException(status_code=400, detail="todo item not found")
    return db_items


@router.delete(path="/remove")
def remove(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: Todo,
    db: Session = Depends(get_db),
):
    deleted_rows = todo_crud.remove(db=db, todo=todo, user_id=current_user.id)
    if deleted_rows == 0:
        raise HTTPException(status_code=400, detail="todo item not found")


@router.get("/list", response_model=list[Todo])
def get_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    search_todo_params: SearchTodoParams = Depends(SearchTodoParams),
    db: Session = Depends(get_db),
):
    items = todo_crud.get_todos_for_user(db, current_user.id, search_todo_params)
    return items


@router.get("/all-users", response_model=list[Todo])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = todo_crud.get_todos(db, skip=skip, limit=limit)
    return todos
