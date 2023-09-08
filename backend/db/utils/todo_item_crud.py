from sqlalchemy.orm import Session
from db.models.todo_category import TodoCategory


from db.models.todo_item import TodoItem
from db.models.user import User
from db.schemas.todo_item import (
    SearchTodoStatus,
    TodoItemCreate,
    TodoItemDelete,
    TodoItemUpdate,
    SearchTodoItemParams,
)


def get_todos_for_user(
    db: Session, user_id: int, search_todo_params: SearchTodoItemParams
):
    query = db.query(TodoItem)

    if search_todo_params.status == SearchTodoStatus.DONE:
        query = query.filter(TodoItem.is_done == True)
    elif search_todo_params.status == SearchTodoStatus.PENDING:
        query = query.filter(TodoItem.is_done == False)

    return query.join(User).filter(User.id == user_id).all()


def create(db: Session, todo: TodoItemCreate, user_id: int):
    db_item = TodoItem(**todo.model_dump(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update(db: Session, todo: TodoItemUpdate, user_id: int):
    db_item = (
        db.query(TodoItem)
        .filter(TodoItem.id == todo.id)
        .join(TodoCategory)
        .filter(TodoCategory.user_id == user_id)
        .first()
    )
    if not db_item:
        return None

    db_item.is_done = todo.is_done
    db_item.description = todo.description
    db_item.title = todo.title

    db.commit()
    db.refresh(db_item)
    return db_item


def remove(db: Session, todo: TodoItemDelete, user_id: int):
    row_count = (
        db.query(TodoItem)
        .filter(TodoItem.id == todo.id, TodoItem.user_id == user_id)
        .delete()
    )
    db.commit()
    return row_count
