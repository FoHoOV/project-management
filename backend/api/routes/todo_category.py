from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_category import (
    TodoCategory,
    TodoCategoryAddToProject,
    TodoCategoryCreate,
    TodoCategoryRead,
    TodoCategoryUpdate,
    TodoCategoryDelete,
)
from db.utils import todo_category_crud


router = APIRouter(prefix="/todo-category", tags=["todo-category"])


@router.post("/create", response_model=TodoCategory)
def create_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    category: TodoCategoryCreate,
    db: Session = Depends(get_db),
):
    return todo_category_crud.create(db=db, category=category, user_id=current_user.id)


@router.post("/add-to-project")
def add_to_project(
    current_user: Annotated[User, Depends(get_current_user)],
    association: TodoCategoryAddToProject,
    db: Session = Depends(get_db),
):
    todo_category_crud.add_another_project(
        db=db, association=association, user_id=current_user.id
    )


@router.patch(path="/update", response_model=TodoCategory)
def update(
    current_user: Annotated[User, Depends(get_current_user)],
    category: TodoCategoryUpdate,
    db: Session = Depends(get_db),
):
    db_items = todo_category_crud.update(
        db=db, category=category, user_id=current_user.id
    )

    return db_items


@router.delete(path="/remove")
def remove(
    current_user: Annotated[User, Depends(get_current_user)],
    category: TodoCategoryDelete,
    db: Session = Depends(get_db),
):
    deleted_rows = todo_category_crud.remove(
        db=db, category=category, user_id=current_user.id
    )
    if deleted_rows == 0:
        raise HTTPException(status_code=404, detail="todo category not found")


@router.get("/list", response_model=list[TodoCategory])
def get_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    filter: TodoCategoryRead = Depends(TodoCategoryRead),
    db: Session = Depends(get_db),
):
    items = todo_category_crud.get_categories_for_project(db, filter, current_user.id)
    return items
