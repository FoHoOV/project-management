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
    # I have an ordered list of items, and the type of these items is defined as follows:

    # ```typescript
    # type Item {
    #     id: number;
    #     next: number | null;
    # }
    # ```

    # Here, `id` is unique, and the mentioned list is initially ordered by `id`. The `next` property represents the ID of the next item in the list, and it may be `null`. Let's discuss the purpose of the `next` property. If a user wishes to create a custom order for this list, they can do so by setting the `next` value.

    # For example, consider the following list:

    # ```typescript
    # const myList = [
    #     { id: 5, next: null },
    #     { id: 4, next: null },
    #     { id: 2, next: null },
    #     { id: 1, next: 5 }
    # ];
    # ```

    # To order this list, it should become:

    # ```typescript
    # const orderedList = [
    #     { id: 5, next: null },
    #     { id: 1, next: 5 },
    #     { id: 4, next: null },
    #     { id: 2, next: null }
    # ];
    # ```

    # Essentially, what happens is that we initially order the list by `id`, and then we rearrange the elements based on the `next` property. If `next` points to item `a`, the mentioned item should be exactly below item `a`. Additionally, there are constraints: for each list, the `next` value is unique throughout the entire list.

    # Consider another example:

    # ```typescript
    # const myList = [
    #     { id: 5, next: null },
    #     { id: 4, next: 1 },
    #     { id: 2, next: null },
    #     { id: 1, next: 5 }
    # ];
    # ```

    # The ordered list would be:

    # ```typescript
    # const orderedList = [
    #     { id: 5, next: null },
    #     { id: 1, next: 5 },
    #     { id: 4, next: 1 },
    #     { id: 2, next: null }
    # ];
    # ```

    # So I want to prioritize the ordering based on the 'next' property when it is not null.
    # This requires that next values don't create a cyclic order and hopefully we are taking that into account.

    validate_todo_category_belongs_to_user(db, category.id, user_id)
    validate_todo_category_belongs_to_user(db, category.order.next_id, user_id)
    validate_project_belongs_to_user(db, category.project_id, user_id, user_id, True)

    db_item = (
        db.query(TodoCategory)
        .join(TodoCategory.projects)
        .filter(TodoCategory.id == category.id, Project.id == category.project_id)
        .first()
    )

    if db_item is None:
        raise UserFriendlyError("todo category doesn't exist or doesn't belong to user")

    if (
        db.query(TodoCategory)
        .filter(
            TodoCategory.id == category.order.next_id, Project.id == category.project_id
        )
        .count()
        == 0
    ):
        raise UserFriendlyError("todo category(next) doesn't belong to this project")

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

    # point new.next to item.next
    db.query(TodoCategoryOrder).filter(
        TodoCategoryOrder.project_id == category.project_id,
        TodoCategoryOrder.category_id == category.order.next_id,
    ).update({"next_id": order.next_id if order is not None else None})

    # point existing item where next=new.next to self.id
    db.query(TodoCategoryOrder).filter(
        TodoCategoryOrder.project_id == category.project_id,
        TodoCategoryOrder.next_id == category.order.next_id,
    ).update({"next_id": category.id})

    if order is None:
        db.add(
            TodoCategoryOrder(
                category_id=category.id,
                project_id=category.project_id,
                next_id=category.order.next_id,
            )
        )
    else:
        order.next_id = category.order.next_id

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
