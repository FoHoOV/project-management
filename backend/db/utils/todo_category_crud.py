from typing import List
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from db.models import project
from db.models.project import Project
from db.models.todo_category import TodoCategory
from db.models.todo_category_order import TodoCategoryOrder
from db.models.todo_category_project_association import TodoCategoryProjectAssociation
from db.models.todo_item import TodoItem
from db.models.user import User

from db.schemas.todo_category import (
    TodoCategoryAttachAssociation,
    TodoCategoryDetachAssociation,
    TodoCategoryRead,
    TodoCategoryCreate,
    TodoCategoryUpdateItem,
    TodoCategoryUpdateOrder,
)
from db.utils.exceptions import UserFriendlyError
from db.utils.project_crud import validate_project_belongs_to_user


def get_categories_for_project(db: Session, filter: TodoCategoryRead, user_id: int):
    validate_project_belongs_to_user(
        db,
        filter.project_id,
        user_id,
        user_id,
        True,
    )
    return (
        db.query(TodoCategory)
        .join(TodoCategory.projects)
        .filter(Project.id == filter.project_id)
        .order_by(TodoCategory.id.desc())
    )


def create(db: Session, category: TodoCategoryCreate, user_id: int):
    validate_project_belongs_to_user(
        db,
        category.project_id,
        user_id,
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


def update_item(db: Session, category: TodoCategoryUpdateItem, user_id: int):
    validate_todo_category_belongs_to_user(db, category.id, user_id)

    db_item = db.query(TodoCategory).filter(TodoCategory.id == category.id).first()

    if db_item is None:
        raise UserFriendlyError("todo category doesn't exist or doesn't belong to user")

    if category.description is not None:
        db_item.description = category.description

    if category.title is not None:
        db_item.title = category.title

    db.commit()
    db.refresh(db_item)
    return db_item


def update_order(db: Session, category: TodoCategoryUpdateOrder, user_id: int):
    # this is a huge performance hit, first of all improve your queries and secondly come up with a new solution
    # btw ik this is not clean code an a huge red flag
    validate_todo_category_belongs_to_user(db, category.id, user_id)
    validate_project_belongs_to_user(db, category.project_id, user_id, user_id, True)

    db_item = (
        db.query(TodoCategory)
        .join(TodoCategory.projects)
        .filter(TodoCategory.id == category.id, Project.id == category.project_id)
        .first()
    )

    if db_item is None:
        raise UserFriendlyError("todo category doesn't exist or doesn't belong to user")

    filtered_orders = list(
        filter(lambda order: order.category_id == category.id, db_item.orders)
    )
    if len(filtered_orders) > 1:
        raise UserFriendlyError(
            "db error: TodoCategory has more than 1 order for this project"
        )

    order: TodoCategoryOrder | None = (
        filtered_orders[0] if len(filtered_orders) == 1 else None
    )

    existing_right_link: List[TodoCategoryOrder] = []
    if category.order.right_id is not None:
        existing_right_link = (
            db.query(TodoCategoryOrder)
            .filter(
                TodoCategoryOrder.project_id == category.project_id,
                TodoCategoryOrder.right_id == category.order.right_id,
            )
            .all()
        )

    existing_left_link: List[TodoCategoryOrder] = []
    if category.order.right_id is not None:
        existing_left_link = (
            db.query(TodoCategoryOrder)
            .filter(
                TodoCategoryOrder.project_id == category.project_id,
                TodoCategoryOrder.left_id == category.order.left_id,
            )
            .all()
        )

    if len(existing_right_link) > 1 or len(existing_left_link) > 1:
        raise UserFriendlyError(
            "db error: TodoCategory has more than 1 order for this project"
        )

    if len(existing_right_link) == 1:
        existing_right_link[0].right_id = category.id

    if len(existing_left_link) == 1:
        existing_left_link[0].left_id = category.id

    db.query(TodoCategoryOrder).filter(
        TodoCategoryOrder.project_id == category.project_id,
        TodoCategoryOrder.right_id == category.id,
    ).update({"right_id": order.right_id if order is not None else None})

    db.query(TodoCategoryOrder).filter(
        TodoCategoryOrder.project_id == category.project_id,
        TodoCategoryOrder.left_id == category.id,
    ).update({"left_id": order.left_id if order is not None else None})

    if order is None:
        db.add(
            TodoCategoryOrder(
                category_id=category.id,
                project_id=category.project_id,
                right_id=category.order.right_id,
                left_id=category.order.left_id,
            )
        )
    else:
        order.right_id = category.order.right_id
        order.left_id = category.order.left_id

    db.commit()
    db.refresh(db_item)
    return db_item


def attach_to_project(
    db: Session, association: TodoCategoryAttachAssociation, user_id: int
):
    validate_todo_category_belongs_to_user(db, association.category_id, user_id)
    validate_project_belongs_to_user(
        db,
        association.project_id,
        user_id,
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
    validate_project_belongs_to_user(
        db,
        association.project_id,
        user_id,
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
        .join(TodoCategory.projects)
        .join(Project.users)
        .filter(User.id == user_id)
        .count()
        == 0
    ):
        raise UserFriendlyError("todo category doesn't exist or doesn't belong to user")
