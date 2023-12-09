from sqlalchemy.orm import Session
from db.models.todo_item import TodoItem
from db.models.todo_item_comments import TodoItemComment
from db.schemas.todo_item_comment import (
    TodoCommentCreate,
    TodoCommentDelete,
    TodoCommentSearch,
    TodoCommentUpdate,
)
from db.utils.exceptions import UserFriendlyError
from db.utils.todo_item_crud import validate_todo_item_belongs_to_user


def create(db: Session, comment: TodoCommentCreate, user_id: int):
    validate_todo_item_belongs_to_user(db, comment.todo_id, user_id)

    db_item = TodoItemComment(**comment.model_dump())
    db.add(db_item)

    db.commit()
    db.refresh(db_item)

    return db_item


def list(db: Session, search: TodoCommentSearch, user_id: int):
    validate_todo_item_belongs_to_user(db, search.todo_id, user_id)

    return (
        db.query(TodoItemComment)
        .filter(TodoItemComment.todo_id == search.todo_id)
        .all()
    )


def edit(db: Session, comment: TodoCommentUpdate, user_id: int):
    validate_todo_item_belongs_to_user(db, comment.todo_id, user_id)

    db_item = db.query(TodoItemComment).filter(TodoItemComment.id == comment.id).first()

    if db_item is None:
        raise

    db_item.message = comment.message

    db.commit()
    db.refresh(db_item)

    return db_item


def delete(db: Session, comment: TodoCommentDelete, user_id: int):
    validate_todo_comment_belongs_to_user(db, comment.id, user_id)
    db.query(TodoItemComment).filter(TodoItemComment.id == comment.id).delete()
    db.commit()


def validate_todo_comment_belongs_to_user(
    db: Session, todo_comment_id: int, user_id: int
):
    todo_comment = (
        db.query(TodoItemComment).filter(TodoItemComment.id == todo_comment_id).first()
    )

    if todo_comment is None:
        raise UserFriendlyError("todo comment not found or doesn't belong to user")

    try:
        validate_todo_item_belongs_to_user(db, todo_comment.todo_id, user_id)
    except:
        raise UserFriendlyError("todo comment not found or doesn't belong to user")
