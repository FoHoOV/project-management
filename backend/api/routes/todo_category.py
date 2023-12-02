from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response
from starlette.status import HTTP_200_OK
from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.models.user import User
from db.schemas.todo_category import (
    TodoCategory,
    TodoCategoryAttachAssociation,
    TodoCategoryCreate,
    TodoCategoryDetachAssociation,
    TodoCategoryRead,
    TodoCategoryUpdateItem,
    TodoCategoryUpdateOrder,
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


@router.post("/attach-to-project", response_model=TodoCategory)
def attach_to_project(
    current_user: Annotated[User, Depends(get_current_user)],
    association: TodoCategoryAttachAssociation,
    db: Session = Depends(get_db),
):
    return todo_category_crud.attach_to_project(
        db=db, association=association, user_id=current_user.id
    )


@router.delete(path="/detach-from-project")
def detach_from_project(
    current_user: Annotated[User, Depends(get_current_user)],
    association: TodoCategoryDetachAssociation,
    db: Session = Depends(get_db),
):
    todo_category_crud.detach_from_project(
        db=db, association=association, user_id=current_user.id
    )

    return Response(status_code=HTTP_200_OK)


@router.patch(path="/update-item", response_model=TodoCategory)
def update_item(
    current_user: Annotated[User, Depends(get_current_user)],
    category: TodoCategoryUpdateItem,
    db: Session = Depends(get_db),
):
    db_items = todo_category_crud.update_item(
        db=db, category=category, user_id=current_user.id
    )

    return db_items


@router.patch(path="/update-order")
def update_order(
    current_user: Annotated[User, Depends(get_current_user)],
    category: TodoCategoryUpdateOrder,
    db: Session = Depends(get_db),
):
    todo_category_crud.update_order(db=db, new_order=category, user_id=current_user.id)
    return Response(status_code=HTTP_200_OK)


@router.get("/list", response_model=list[TodoCategory])
def get_for_user(
    current_user: Annotated[User, Depends(get_current_user)],
    filter: TodoCategoryRead = Depends(TodoCategoryRead),
    db: Session = Depends(get_db),
):
    items = todo_category_crud.get_categories_for_project(db, filter, current_user.id)
    return items
