from typing import Annotated
from fastapi import APIRouter, Depends, Query, Response
from starlette.status import HTTP_200_OK
from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_category import (
    TodoCategory,
    TodoCategoryAttachAssociation,
    TodoCategoryCreate,
    TodoCategoryUpdate,
)
from db.utils import todo_category_crud


router = APIRouter(prefix="/todo-categories", tags=["todo-categories"])


@router.post("/", response_model=TodoCategory)
def create_for_user(
    category: TodoCategoryCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return todo_category_crud.create(db, category, current_user.id)


@router.post("/{category_id}/projects", response_model=TodoCategoryAttachAssociation)
def attach_to_project(
    category_id: int,
    association: TodoCategoryAttachAssociation,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return todo_category_crud.attach_to_project(
        db, category_id, association, current_user.id
    )


@router.delete(path="/{category_id}/projects/{project_id}")
def detach_from_project(
    category_id: int,
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    todo_category_crud.detach_from_project(db, category_id, project_id, current_user.id)

    return Response(status_code=HTTP_200_OK)


@router.patch(path="/{category_id}", response_model=TodoCategory)
def update(
    category_id: int,
    category: TodoCategoryUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):

    if category.item is not None:
        db_items = todo_category_crud.update_item(
            db, category_id, category.item, current_user.id
        )

    if category.order is not None:
        db_items = todo_category_crud.update_order(
            db, category_id, category.order, current_user.id
        )
    return db_items


@router.get("/", response_model=list[TodoCategory])
def search(
    project_id: Annotated[int, Query()],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    items = todo_category_crud.get_categories_for_project(
        db, project_id, current_user.id
    )
    return items
