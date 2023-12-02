from typing import List
from db.utils.element_sort_update import update_element_order
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, Query
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


def update_order(db: Session, new_order: TodoCategoryUpdateOrder, user_id: int):
    validate_todo_category_belongs_to_user(db, new_order.id, user_id)
    validate_todo_category_belongs_to_user(db, new_order.order.next_id, user_id)
    validate_project_belongs_to_user(db, new_order.project_id, user_id, user_id, True)

    def get_next_id(category: TodoCategory):
        filtered_orders = list(
            filter(lambda order: order.category_id == category.id, category.orders)
        )
        if len(filtered_orders) > 1:
            raise UserFriendlyError(
                "db error: TodoCategory has more than 1 order for this project"
            )

        return filtered_orders[0] if len(filtered_orders) == 1 else None

    def create_order(id: int, next_id: int):
        db.add(
            TodoCategoryOrder(
                category_id=id,
                project_id=new_order.project_id,
                next_id=next_id,
            )
        )

    update_element_order(
        db,
        TodoCategory,
        TodoCategoryOrder,
        db.query(TodoCategoryOrder).filter(
            TodoCategoryOrder.project_id == new_order.project_id
        ),
        new_order.moving_id,
        new_order,
        get_next_id,
        create_order,
    )

    db.commit()


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

    association_db_item = TodoCategoryProjectAssociation(
        todo_category_id=association.category_id, project_id=association.project_id
    )

    try:
        db.add(association_db_item)
        db.commit()
        db.refresh(association_db_item)
        return association_db_item
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

    # this belongs to user cuz we have already checked it
    current_category_order = (
        db.query(TodoCategoryOrder)
        .filter(
            TodoCategoryOrder.project_id == association.project_id,
            TodoCategoryOrder.category_id == association.category_id,
        )
        .first()
    )

    # update item.next to current.next where item.next = current.category_id
    db.query(TodoCategoryOrder).filter(
        TodoCategoryOrder.project_id == association.project_id,
        TodoCategoryOrder.next_id == association.category_id,
    ).update(
        {
            "next_id": current_category_order.next_id
            if current_category_order is not None
            else None
        }
    )

    db.delete(current_category_order)

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
