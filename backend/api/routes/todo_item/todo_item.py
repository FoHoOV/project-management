from typing import Annotated
from fastapi import APIRouter, Depends, Query, Response
from starlette.status import HTTP_200_OK

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_item import (
    SearchTodoStatus,
    TodoItem,
    TodoItemAddDependency,
    TodoItemCreate,
    TodoItemPartialDependency,
    TodoItemUpdate,
)
from db.utils import todo_item_crud


router = APIRouter(prefix="/todo-items", tags=["todo-items"])


@router.post("/", response_model=TodoItem)
def create_for_user(
    todo: TodoItemCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    result = todo_item_crud.create(db, todo, current_user.id)
    return result


@router.patch(path="/{todo_id}", response_model=TodoItem)
def update_item(
    todo_id: int,
    todo: TodoItemUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    if todo.item is not None:
        db_items = todo_item_crud.update_item(db, todo_id, todo.item, current_user.id)
    if todo.order is not None:
        db_items = todo_item_crud.update_order(db, todo_id, todo.order, current_user.id)
    return db_items


@router.delete(path="/{todo_id}")
def remove(
    todo_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    todo_item_crud.remove(db, todo_id, current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.post(path="/{todo_id}/dependencies", response_model=TodoItemPartialDependency)
def add_todo_item_dependency(
    todo_id: int,
    dependency: TodoItemAddDependency,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    dependency.ensure_different_todo_ids(todo_id)
    return todo_item_crud.add_todo_dependency(db, todo_id, dependency, current_user.id)


@router.delete(path="/{todo_id}/dependencies/{dependent_todo_id}")
def remove_todo_item_dependency(
    todo_id: int,
    dependent_todo_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    todo_item_crud.remove_todo_dependency(
        db, todo_id, dependent_todo_id, current_user.id
    )
    return Response(status_code=HTTP_200_OK)


@router.get("/", response_model=list[TodoItem])
def search(
    current_user: Annotated[User, Depends(get_current_user)],
    project_id: Annotated[int, Query()],
    category_id: Annotated[int, Query()],
    status: Annotated[SearchTodoStatus, Query()] = SearchTodoStatus.ALL,
    db: Session = Depends(get_db),
):
    items = todo_item_crud.get_todos_for_user(
        db, project_id, category_id, status, current_user.id
    )
    return items
