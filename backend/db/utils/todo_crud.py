from re import I
import stat
from sqlalchemy import delete
from sqlalchemy.orm import Session


from db.models.todo import Todo
from db.models.user import User
from db.schemas.todo import SearchTodoStatus, TodoCreate, Todo as TodoSchema, SearchTodoParams


def get_todos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Todo).offset(skip).limit(limit).all()


def get_todos_for_user(db: Session, user_id: int, search_todo_params: SearchTodoParams):
    query = db.query(Todo)

    if search_todo_params.status == SearchTodoStatus.DONE:
        query = query.filter(Todo.is_done == True)
    elif search_todo_params.status == SearchTodoStatus.PENDING:
        query = query.filter(Todo.is_done == False)

    return query.join(User).filter(User.id == user_id).all()


def create_todo(db: Session, todo: TodoCreate, user_id: int):
    db_item = Todo(**todo.model_dump(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update(db: Session, todo: TodoSchema, user_id: int):
    db_item = (
        db.query(Todo)
        .filter(Todo.id == todo.id, Todo.user_id == user_id)
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


def remove(db: Session, todo: TodoSchema, user_id: int):
    row_count = (
        db.query(Todo).filter(Todo.id == todo.id, Todo.user_id == user_id).delete()
    )
    db.commit()
    return row_count
