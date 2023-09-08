from re import I
import stat
from sqlalchemy import delete
from sqlalchemy.orm import Session
from db.models.todo_category import TodoCategory

from db.models.user import User
from db.schemas.todo_category import (
    TodoCategoryCreate,
    TodoCategoryUpdate,
    TodoCategoryDelete,
)


def get_categories_for_user(db: Session, user_id: int):
    return db.query(TodoCategory).filter(User.id == user_id).all()


def create(db: Session, category: TodoCategoryCreate, user_id: int):
    db_item = TodoCategory(**category.model_dump(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update(db: Session, category: TodoCategoryUpdate, user_id: int):
    db_item = (
        db.query(TodoCategory)
        .filter(TodoCategory.id == category.id, TodoCategory.user_id == user_id)
        .first()
    )
    if not db_item:
        return None

    db_item.description = category.description
    db_item.title = category.title

    db.commit()
    db.refresh(db_item)
    return db_item


def remove(db: Session, category: TodoCategoryDelete, user_id: int):
    row_count = (
        db.query(TodoCategory)
        .filter(TodoCategory.id == category.id, TodoCategory.user_id == user_id)
        .delete()
    )
    db.commit()
    return row_count
