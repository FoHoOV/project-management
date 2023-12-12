from sqlalchemy.orm import Session
from db.models.project import Project
from db.models.tag import Tag
from db.models.todo_item import TodoItem
from db.models.todo_item_tag_association import TodoItemTagAssociation
from db.models.user import User
from db.schemas.tag import (
    TagAttachToTodo,
    TagCreate,
    TagDelete,
    TagDetachFromTodo,
    TagSearch,
    TagUpdate,
)
from db.utils.exceptions import UserFriendlyError
from db.utils.project_crud import validate_project_belongs_to_user
from db.utils.todo_item_crud import validate_todo_item_belongs_to_user


def create(db: Session, tag: TagCreate, user_id: int):
    validate_project_belongs_to_user(db, tag.project_id, user_id, user_id, True)

    tag_already_exists = False
    try:
        validate_tag_belongs_to_user_by_name(db, tag.name, user_id)
        tag_already_exists = True
    except UserFriendlyError:
        pass

    if tag_already_exists:
        raise UserFriendlyError("This tag already exists for this project")

    db_item = Tag(**tag.model_dump())
    db.add(db_item)

    db.commit()
    db.refresh(db_item)

    return db_item


def search(db: Session, search: TagSearch, user_id: int):
    validate_tag_belongs_to_user_by_name(db, search.name, user_id)

    return (
        db.query(Tag)
        .join(Project.users)
        .filter(User.id == user_id)
        .join(Project.tags)
        .filter(Tag.name == search.name)
        .all()
    )


def edit(db: Session, tag: TagUpdate, user_id: int):
    validate_tag_belongs_to_user_by_id(db, tag.id, user_id)

    db_item = db.query(Tag).filter(Tag.id == tag.id).first()

    if db_item is None:
        raise

    db_item.name = tag.name

    db.commit()
    db.refresh(db_item)

    return db_item


def delete(db: Session, tag: TagDelete, user_id: int):
    validate_tag_belongs_to_user_by_id(db, tag.id, user_id)
    db.query(Tag).filter(Tag.id == tag.id).delete()
    db.commit()


def attach_tag_to_todo(db: Session, association: TagAttachToTodo, user_id: int):
    validate_todo_item_belongs_to_user(db, association.todo_id, user_id)
    validate_tag_belongs_to_user_by_id(db, association.tag_id, user_id)

    tag_already_exists_for_todo = (
        db.query(TodoItem)
        .filter(TodoItem.id == association.todo_id)
        .join(TodoItem.tags)
        .filter(Tag.id == association.tag_id)
        .count()
        > 0
    )

    if tag_already_exists_for_todo:
        raise UserFriendlyError("this tag already belongs to this todo")

    db_item = TodoItemTagAssociation(
        todo_id=association.todo_id, tag_id=association.tag_id
    )
    db.add(db_item)

    db.commit()
    db.refresh(db_item)

    return db_item


def detach_tag_from_todo(db: Session, association: TagDetachFromTodo, user_id: int):
    validate_todo_item_belongs_to_user(db, association.todo_id, user_id)
    validate_tag_belongs_to_user_by_id(db, association.tag_id, user_id)

    affected_columns = (
        db.query(TodoItemTagAssociation)
        .filter(
            TodoItemTagAssociation.todo_id == association.todo_id,
            TodoItemTagAssociation.tag_id == association.tag_id,
        )
        .delete()
    )

    if affected_columns == 0:
        raise UserFriendlyError("this tag doesn't exist for this todo")

    db.commit()


def validate_tag_belongs_to_user_by_name(db: Session, tag_name: str, user_id: int):
    result = (
        db.query(Project)
        .join(Project.users)
        .filter(User.id == user_id)
        .join(Project.tags)
        .filter(Tag.name == tag_name)
        .count()
    )
    if result == 0:
        raise UserFriendlyError("tag not found or doesn't belong to user")


def validate_tag_belongs_to_user_by_id(db: Session, tag_id: int, user_id: int):
    result = (
        db.query(Project)
        .join(Project.users)
        .filter(User.id == user_id)
        .join(Project.tags)
        .filter(Tag.id == tag_id)
        .count()
    )
    if result == 0:
        raise UserFriendlyError("tag not found or doesn't belong to user")
