from typing import Annotated
from unittest import result
from fastapi import APIRouter, Depends, HTTPException, Response
from starlette.status import HTTP_200_OK

from sqlalchemy.orm import Session
from api import dependencies
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_item import (
    SearchTodoItemParams,
    TodoItem,
    TodoItemAddDependency,
    TodoItemCreate,
    TodoItemPartialDependency,
    TodoItemRemoveDependency,
    TodoItemUpdateItem,
    TodoItemDelete,
    TodoItemUpdateOrder,
)
from db.utils import todo_item_crud


router = APIRouter(prefix="/todo-item", tags=["todo-item"])


@router.post("/create", response_model=TodoItem)
def create_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoItemCreate,
    db: Session = Depends(get_db),
):
    result = todo_item_crud.create(db=db, todo=todo, user_id=current_user.id)
    return result


@router.patch(path="/update-item", response_model=TodoItem)
def update_item(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoItemUpdateItem,
    db: Session = Depends(get_db),
):
    db_items = todo_item_crud.update_item(db=db, todo=todo, user_id=current_user.id)
    return db_items


@router.patch(path="/update-order")
def update_order(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoItemUpdateOrder,
    db: Session = Depends(get_db),
):
    todo_item_crud.update_order(db=db, moving_item=todo, user_id=current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.delete(path="/remove")
def remove(
    current_user: Annotated[User, Depends(get_current_user)],
    todo: TodoItemDelete,
    db: Session = Depends(get_db),
):
    todo_item_crud.remove(db=db, todo=todo, user_id=current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.post(path="/add-todo-dependency", response_model=TodoItemPartialDependency)
def add_todo_item_dependency(
    current_user: Annotated[User, Depends(get_current_user)],
    dependency: TodoItemAddDependency,
    db: Session = Depends(get_db),
):
    return todo_item_crud.add_todo_dependency(
        db=db, dependency=dependency, user_id=current_user.id
    )


@router.delete(path="/remove-todo-dependency")
def remove_todo_item_dependency(
    current_user: Annotated[User, Depends(get_current_user)],
    dependency: TodoItemRemoveDependency,
    db: Session = Depends(get_db),
):
    todo_item_crud.remove_todo_dependency(
        db=db, dependency=dependency, user_id=current_user.id
    )
    return Response(status_code=HTTP_200_OK)


@router.get("/list", response_model=list[TodoItem])
def get_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    search_todo_params: SearchTodoItemParams = Depends(SearchTodoItemParams),
    db: Session = Depends(get_db),
):
    items = todo_item_crud.get_todos_for_user(db, search_todo_params, current_user.id)
    return items
