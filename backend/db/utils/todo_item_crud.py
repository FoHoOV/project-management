from typing import List
from sqlalchemy.orm import Session
from db.models.project import Project
from db.models.todo_category import TodoCategory


from db.models.todo_item import TodoItem
from db.models.todo_item_order import TodoItemOrder
from db.models.user import User
from db.schemas.todo_item import (
    SearchTodoStatus,
    TodoItemCreate,
    TodoItemDelete,
    TodoItemUpdateItem,
    SearchTodoItemParams,
    TodoItemUpdateOrder,
)
from db.utils.exceptions import UserFriendlyError
from db.utils.project_crud import validate_project_belongs_to_user
from db.utils.todo_category_crud import validate_todo_category_belongs_to_user


def get_todos_for_user(
    db: Session, search_todo_params: SearchTodoItemParams, user_id: int
):
    validate_project_belongs_to_user(
        db,
        search_todo_params.project_id,
        user_id,
        user_id,
        True,
    )

    validate_todo_category_belongs_to_user(db, search_todo_params.category_id, user_id)

    query = db.query(TodoItem)

    if search_todo_params.status == SearchTodoStatus.DONE:
        query = query.filter(TodoItem.is_done == True)
    elif search_todo_params.status == SearchTodoStatus.PENDING:
        query = query.filter(TodoItem.is_done == False)

    return (
        query.join(TodoCategory)
        .filter(TodoCategory.id == search_todo_params.category_id)
        .join(TodoCategory.projects)
        .filter(Project.id == search_todo_params.project_id)
        .join(Project.users)
        .filter(User.id == user_id)
        .order_by(TodoItem.order.desc(), TodoItem.id.desc())
        .all()
    )


def create(db: Session, todo: TodoItemCreate, user_id: int):
    validate_todo_category_belongs_to_user(db, todo.category_id, user_id)

    db_item = TodoItem(**todo.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, todo: TodoItemUpdateItem, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id)

    db_item = (
        db.query(TodoItem)
        .filter(TodoItem.id == todo.id)
        .join(TodoCategory)
        .filter(TodoCategory.id == todo.category_id)
        .first()
    )

    if not db_item:
        raise UserFriendlyError("todo item doesn't exist or doesn't belong to user")

    if todo.new_category_id is not None:
        validate_todo_category_belongs_to_user(db, todo.new_category_id, user_id)
        db_item.category_id = todo.new_category_id

    if todo.is_done is not None:
        db_item.is_done = todo.is_done

    if todo.description is not None:
        db_item.description = todo.description

    if todo.title is not None:
        db_item.title = todo.title

    db.commit()
    db.refresh(db_item)
    return db_item


def update_order(db: Session, todo: TodoItemUpdateOrder, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id)

    db_item = (
        db.query(TodoItem).join(TodoItem.order).filter(TodoItem.id == todo.id).first()
    )

    if db_item is None:
        raise UserFriendlyError("todo item doesn't exist or doesn't belong to user")

    existing_right_link: List[TodoItemOrder] = []
    if todo.order.right_id is not None:
        existing_right_link = (
            db.query(TodoItemOrder)
            .filter(
                TodoItemOrder.right_id == todo.order.right_id,
            )
            .join(TodoItemOrder.todo)
            .join(TodoCategory)
            .filter(TodoCategory.id == TodoItem.id)
            .all()
        )

    existing_left_link: List[TodoItemOrder] = []
    if todo.order.right_id is not None:
        existing_left_link: List[TodoItemOrder] = (
            db.query(TodoItemOrder)
            .filter(
                TodoItemOrder.left_id == todo.order.left_id,
            )
            .join(TodoItemOrder.todo)
            .join(TodoCategory)
            .filter(TodoCategory.id == TodoItem.id)
            .all()
        )

    if len(existing_right_link) > 1 or len(existing_left_link) > 1:
        raise UserFriendlyError(
            "db error: TodoItem has more than 1 order for this category"
        )

    if len(existing_right_link) == 1:
        existing_right_link[0].right_id = todo.id

    if len(existing_left_link) == 1:
        existing_left_link[0].left_id = todo.id

    if db_item.order is None:
        db.add(
            TodoItemOrder(
                todo_id=todo.id,
                right_id=todo.order.right_id,
                left_id=todo.order.left_id,
            )
        )
    else:
        db_item.order.right_id = todo.order.right_id
        db_item.order.left_id = todo.order.left_id

    db.commit()
    db.refresh(db_item)
    return db_item


def remove(db: Session, todo: TodoItemDelete, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id=user_id)

    db.query(TodoItem).filter(TodoItem.id == todo.id).delete()
    db.commit()


def validate_todo_item_belongs_to_user(db: Session, todo_id: int, user_id: int):
    if (
        db.query(TodoItem)
        .filter(TodoItem.id == todo_id)
        .join(TodoCategory)
        .join(TodoCategory.projects)
        .join(Project.users)
        .filter(User.id == user_id)
        .count()
        == 0
    ):
        raise UserFriendlyError("todo item doesn't exist or doesn't belong to user")
