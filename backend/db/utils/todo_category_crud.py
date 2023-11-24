from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from db.models.project_user_association import ProjectUserAssociation
from db.models.todo_category import TodoCategory
from db.models.todo_category_project_association import TodoCategoryProjectAssociation

from db.schemas.project import ProjectUserAssociationValidation
from db.schemas.todo_category import (
    TodoCategoryAttachAssociation,
    TodoCategoryDetachAssociation,
    TodoCategoryRead,
    TodoCategoryCreate,
    TodoCategoryUpdate,
)
from db.utils.exceptions import UserFriendlyError
from db.utils.project_crud import validate_project_belong_to_user


def get_categories_for_project(db: Session, filter: TodoCategoryRead, user_id: int):
    validate_project_belong_to_user(
        db,
        ProjectUserAssociationValidation(project_id=filter.project_id, user_id=user_id),
        user_id,
        True,
    )
    return (
        db.query(TodoCategory)
        .join(
            TodoCategoryProjectAssociation,
            TodoCategoryProjectAssociation.project_id == filter.project_id,
        )
        .order_by(TodoCategory.id.desc())
    )


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
        project_id=category.project_id, todo_category_id=db_item.id
    )
    db.add(association)
    db.commit()

    return db_item


def update(db: Session, category: TodoCategoryUpdate, user_id: int):
    validate_todo_category_belongs_to_user(db, category.id, user_id)

    db_item = db.query(TodoCategory).filter(TodoCategory.id == category.id).first()

    if db_item is None:
        raise UserFriendlyError("todo category doesn't exist or doesn't belong to user")

    db_item.description = category.description
    db_item.title = category.title

    db.commit()
    db.refresh(db_item)
    return db_item


def attach_to_project(
    db: Session, association: TodoCategoryAttachAssociation, user_id: int
):
    validate_todo_category_belongs_to_user(db, association.category_id, user_id)
    validate_project_belong_to_user(
        db,
        ProjectUserAssociationValidation(
            project_id=association.project_id, user_id=user_id
        ),
        user_id,
        True,
    )

    association_db = TodoCategoryProjectAssociation(
        todo_category_id=association.category_id, project_id=association.project_id
    )

    try:
        db.add(association_db)
        db.commit()
    except IntegrityError:
        raise UserFriendlyError("this category already belongs to this project")


def detach_from_project(
    db: Session, association: TodoCategoryDetachAssociation, user_id: int
):
    validate_todo_category_belongs_to_user(db, association.category_id, user_id)
    validate_project_belong_to_user(
        db,
        ProjectUserAssociationValidation(
            project_id=association.project_id, user_id=user_id
        ),
        user_id,
        True,
    )

    db.query(TodoCategoryProjectAssociation).filter(
        TodoCategoryProjectAssociation.project_id == association.project_id,
        TodoCategoryProjectAssociation.todo_category_id == association.category_id,
    ).delete()

    if (
        db.query(TodoCategoryProjectAssociation)
        .filter(
            TodoCategoryProjectAssociation.todo_category_id == association.category_id
        )
        .count()
        == 0
    ):
        db.query(TodoCategory).filter(
            TodoCategory.id == association.category_id
        ).delete()

    db.commit()


def validate_todo_category_belongs_to_user(db: Session, category_id: int, user_id: int):
    if (
        db.query(TodoCategory)
        .filter(TodoCategory.id == category_id)
        .join(TodoCategoryProjectAssociation)
        .join(
            ProjectUserAssociation,
            TodoCategoryProjectAssociation.project_id
            == ProjectUserAssociation.project_id,
        )
        .filter(ProjectUserAssociation.user_id == user_id)
        .first()
        is None
    ):
        raise UserFriendlyError("todo category doesn't exist or doesn't belong to user")
