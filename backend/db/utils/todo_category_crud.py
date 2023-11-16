from fastapi.exceptions import ValidationException

from sqlalchemy import delete
from sqlalchemy.orm import Session
from db.models.project_user_association import ProjectUserAssociation
from db.models.todo_category import TodoCategory
from db.models.todo_category_project_association import TodoCategoryProjectAssociation

from db.schemas.project import ProjectUserAssociationValidation
from db.schemas.todo_category import (
    TodoCategoryRead,
    TodoCategoryCreate,
    TodoCategoryUpdate,
    TodoCategoryDelete,
)
from db.utils.project_crud import validate_project_belong_to_user


def get_categories_for_user(db: Session, category: TodoCategoryRead, user_id: int):
    validate_todo_category_belongs_to_user(db, category.id, user_id)
    return db.query(TodoCategory).filter(TodoCategory.id == category.id)


def create(db: Session, category: TodoCategoryCreate, user_id: int):
    validate_project_belong_to_user(
        db,
        ProjectUserAssociationValidation(
            project_id=category.project_id, user_id=user_id
        ),
        user_id,
        True,
    )

    db_item = TodoCategory(**category.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    association = TodoCategoryProjectAssociation(
        project_id=category.project_id, category_id=db_item.id
    )
    db.add(association)
    db.commit()

    return db_item


def update(db: Session, category: TodoCategoryUpdate, user_id: int):
    validate_todo_category_belongs_to_user(db, category.id, user_id)

    db_item = db.query(TodoCategory).filter(TodoCategory.id == category.id).first()

    if db_item is None:
        raise ValidationException(
            "todo category doesn't exist or doesn't belong to user"
        )

    db_item.description = category.description
    db_item.title = category.title

    db.commit()
    db.refresh(db_item)
    return db_item


def remove(db: Session, category: TodoCategoryDelete, user_id: int):
    validate_todo_category_belongs_to_user(db, category.id, user_id)
    row_count = db.query(TodoCategory).filter(TodoCategory.id == category.id).delete()
    db.commit()
    return row_count


def validate_todo_category_belongs_to_user(db: Session, category_id: int, user_id: int):
    if (
        db.query(TodoCategory)
        .filter(TodoCategory.id == category_id)
        .join(TodoCategoryProjectAssociation)
        .join(ProjectUserAssociation)
        .filter(ProjectUserAssociation.user_id == user_id)
        .first()
        is None
    ):
        raise ValidationException(
            "todo category doesn't exist or doesn't belong to user"
        )
