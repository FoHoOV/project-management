from typing import List
from db.utils.element_sort_update import (
    delete_item_from_sorted_items,
    update_element_order,
)
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
        .order_by(TodoItem.id.desc())
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
        db.query(TodoItem).filter(TodoItem.id == todo.id).join(TodoCategory).first()
    )

    if not db_item:
        raise UserFriendlyError("todo item doesn't exist or doesn't belong to user")

    if todo.new_category_id is not None and db_item.category_id != todo.new_category_id:
        validate_todo_category_belongs_to_user(db, todo.new_category_id, user_id)

        delete_item_from_sorted_items(
            db,
            TodoItem,
            db.query(TodoItem),
            todo.id,
            lambda todo_item_id: _get_todo_item_order(db, todo_item_id),
            lambda item: _get_todo_id_from_ordered_item(item),
        )
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


def update_order(db: Session, new_order: TodoItemUpdateOrder, user_id: int):
    validate_todo_item_belongs_to_user(db, new_order.id, user_id)
    validate_todo_item_belongs_to_user(db, new_order.next_id, user_id)
    validate_todo_item_belongs_to_user(db, new_order.moving_id, user_id)

    def create_order(id: int, moving_id: int, next_id: int | None):
        db.add(TodoItemOrder(todo_id=id, moving_id=moving_id, next_id=next_id))

    update_item(
        db,
        TodoItemUpdateItem.model_construct(
            id=new_order.moving_id, new_category_id=new_order.new_category_id
        ),
        user_id,
    )

    update_element_order(
        TodoItemOrder,
        db.query(TodoItemOrder),
        new_order.moving_id,
        {"id": new_order.id, "next_id": new_order.next_id},
        create_order,
        lambda todo_item_id: _get_todo_item_order(db, todo_item_id),
        lambda item: _get_todo_id_from_ordered_item(item),
    )

    db.commit()


def remove(db: Session, todo: TodoItemDelete, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id=user_id)
    db_item = db.query(TodoItem).filter(TodoItem.id == todo.id).first()
    if not db_item:
        return

    delete_item_from_sorted_items(
        db,
        TodoItem,
        db.query(TodoItem),
        todo.id,
        lambda todo_item_id: _get_todo_item_order(db, todo_item_id),
        lambda item: _get_todo_id_from_ordered_item(item),
    )

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


def _get_todo_item_order(db: Session, id: int):
    return db.query(TodoItemOrder).filter(TodoItemOrder.todo_id == id).first()


def _get_todo_id_from_ordered_item(todo_item_order: TodoItemOrder):
    return todo_item_order.todo_id
