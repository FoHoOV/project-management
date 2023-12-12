from db.utils.shared.ordered_item import (
    delete_item_from_sorted_items,
    update_element_order,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, lazyload
from db.models.project import Project
from db.models.todo_category import TodoCategory
from db.models.todo_category_order import TodoCategoryOrder
from db.models.todo_category_project_association import TodoCategoryProjectAssociation
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
        .outerjoin(
            TodoCategory.orders.and_(TodoCategoryOrder.project_id == filter.project_id)
        )
        .join(TodoCategory.projects)
        .filter(Project.id == filter.project_id)
        .order_by(TodoCategory.id.desc())
        .options(
            lazyload(
                TodoCategory.orders.and_(
                    TodoCategoryOrder.project_id == filter.project_id
                )
            )
        )  # TODO: see why the fuck do we need this to exist
        .all()
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
        project_id=category.project_id, category_id=db_item.id
    )
    db.add(association)
    db.commit()

    update_order(
        db,
        TodoCategoryUpdateOrder.model_validate(
            {
                "id": db_item.id,
                "left_id": _get_last_category_id_in_project_except_current(
                    db, db_item.id, category.project_id, user_id
                ),
                "right_id": None,
                "project_id": category.project_id,
            }
        ),
        user_id,
    )

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


def update_order(db: Session, moving_item: TodoCategoryUpdateOrder, user_id: int):
    validate_todo_category_belongs_to_user(db, moving_item.id, user_id)
    if moving_item.left_id is not None:
        validate_todo_category_belongs_to_user(db, moving_item.left_id, user_id)
    if moving_item.right_id is not None:
        validate_todo_category_belongs_to_user(db, moving_item.right_id, user_id)
    validate_project_belongs_to_user(db, moving_item.project_id, user_id, user_id, True)

    def create_order(id: int, left_id: int | None, right_id: int | None):
        db.add(
            TodoCategoryOrder(
                category_id=id,
                project_id=moving_item.project_id,
                left_id=left_id,
                right_id=right_id,
            )
        )

    update_element_order(
        db,
        TodoCategoryOrder,
        db.query(TodoCategoryOrder).filter(
            TodoCategoryOrder.project_id == moving_item.project_id
        ),
        TodoCategoryOrder.category_id,
        {
            "item_id": moving_item.id,
            "left_id": moving_item.left_id,
            "right_id": moving_item.right_id,
        },
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
        category_id=association.category_id, project_id=association.project_id
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

    delete_item_from_sorted_items(
        db,
        TodoCategoryOrder,
        db.query(TodoCategoryOrder).filter(
            TodoCategoryOrder.project_id == association.project_id
        ),
        TodoCategoryOrder.category_id,
        association.category_id,
    )

    db.query(TodoCategoryProjectAssociation).filter(
        TodoCategoryProjectAssociation.project_id == association.project_id,
        TodoCategoryProjectAssociation.category_id == association.category_id,
    ).delete()

    if (
        db.query(TodoCategoryProjectAssociation)
        .filter(TodoCategoryProjectAssociation.category_id == association.category_id)
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


def _get_last_category_id_in_project_except_current(
    db: Session, current_category_id: int, project_id: int, user_id: int
):
    last_item_in_the_list = (
        db.query(TodoCategoryOrder)
        .filter(
            TodoCategoryOrder.project_id == project_id,
            TodoCategoryOrder.right_id == None,
            TodoCategoryOrder.category_id != current_category_id,
        )
        .first()
    )

    if last_item_in_the_list is not None:
        return last_item_in_the_list.category_id

    last_item_in_the_list = get_categories_for_project(
        db, TodoCategoryRead(project_id=project_id), user_id
    )
    if len(last_item_in_the_list) > 0:
        if last_item_in_the_list[0].id != current_category_id:
            return last_item_in_the_list[0].id
        return last_item_in_the_list[1].id if len(last_item_in_the_list) > 1 else None

    return None
