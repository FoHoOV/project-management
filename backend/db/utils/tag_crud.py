from sqlalchemy.orm import Session

from db.models.project import Project
from db.models.tag import Tag
from db.models.todo_category import TodoCategory
from db.models.todo_item import TodoItem
from db.models.todo_item_tag_association import TodoItemTagAssociation
from db.models.user import User
from db.models.user_project_permission import Permission
from db.schemas.tag import TagAttachToTodo, TagCreate, TagDelete, TagUpdate
from db.utils.project_crud import validate_project_belongs_to_user
from db.utils.shared.permission_query import (
    PermissionsType,
    join_with_permission_query_if_required,
    validate_item_exists_with_permissions,
)
from db.utils.todo_item_crud import validate_todo_item_belongs_to_user
from error.exceptions import ErrorCode, UserFriendlyError


def create(db: Session, tag: TagCreate, user_id: int):
    validate_project_belongs_to_user(
        db, tag.project_id, user_id, [Permission.CREATE_TAG]
    )

    tag_already_exists = False
    try:
        validate_tag_belongs_to_user_in_project_by_name(
            db, tag.name, tag.project_id, user_id, [Permission.CREATE_TAG]
        )
        tag_already_exists = True
    except UserFriendlyError:
        pass

    if tag_already_exists:
        raise UserFriendlyError(
            ErrorCode.TAG_PROJECT_ASSOCIATION_ALREADY_EXISTS,
            "This tag already exists for this project",
        )

    db_item = Tag(**tag.model_dump())
    db.add(db_item)

    db.commit()
    return db_item


def search(db: Session, project_id: int | None, name: str, user_id: int):
    validate_tag_belongs_to_user_in_project_by_name(db, name, project_id, user_id, None)

    query = (
        db.query(TodoItem)
        .join(TodoItem.tags)
        .join(TodoItem.category)
        .join(TodoCategory.projects)
        .join(Project.users)
        .filter(User.id == user_id)
        .filter(Tag.name == name)
    )

    if project_id is not None:
        query = query.filter(Project.id == project_id)

    return query.all()


def edit(db: Session, tag_name: str, tag: TagUpdate, user_id: int):
    validate_tag_belongs_to_user_in_project_by_name(
        db, tag_name, tag.project_id, user_id, [Permission.UPDATE_TAG]
    )

    db_item = (
        db.query(Tag)
        .filter(Tag.name == tag_name, Tag.project_id == tag.project_id)
        .first()
    )

    if db_item is None:
        raise

    try:
        validate_tag_belongs_to_user_in_project_by_name(
            db, tag.name, db_item.project_id, user_id, [Permission.UPDATE_TAG]
        )
        raise UserFriendlyError(
            ErrorCode.TAG_PROJECT_ASSOCIATION_ALREADY_EXISTS,
            "This tag already exists, either remove this tag and add the appropriate one, or delete the old and then retry renaming this one",
        )
    except UserFriendlyError as ex:
        if ex.code != ErrorCode.TAG_NOT_FOUND:
            raise

    db_item.name = tag.name

    db.commit()
    return db_item


def delete(db: Session, tag_name: str, tag: TagDelete, user_id: int):
    validate_tag_belongs_to_user_in_project_by_name(
        db, tag_name, tag.project_id, user_id, [Permission.DELETE_TAG]
    )
    db.query(Tag).filter(
        Tag.name == tag_name, Tag.project_id == tag.project_id
    ).delete()
    db.commit()


def attach_tag_to_todo(
    db: Session, tag_name: str, association: TagAttachToTodo, user_id: int
):
    validate_todo_item_belongs_to_user(
        db, association.todo_id, user_id, [Permission.CREATE_TAG]
    )

    try:
        validate_tag_belongs_to_user_in_project_by_name(
            db,
            tag_name,
            association.project_id,
            user_id,
            [Permission.CREATE_TAG],
        )
    except UserFriendlyError as e:
        if e.code != ErrorCode.TAG_NOT_FOUND:
            raise
        if not association.create_if_doesnt_exist:
            raise

        create(
            db,
            TagCreate.model_validate(
                {"name": tag_name, "project_id": association.project_id}
            ),
            user_id,
        )

    tag_base_query = db.query(Tag).filter(
        Tag.name == tag_name, Tag.project_id == association.project_id
    )

    tag_already_exists_for_todo = (
        tag_base_query.join(Tag.todos)
        .filter(TodoItem.id == association.todo_id)
        .count()
        > 0
    )

    if tag_already_exists_for_todo:
        raise UserFriendlyError(
            ErrorCode.TAG_TODO_ASSOCIATION_ALREADY_EXISTS,
            "this tag already belongs to this todo",
        )

    tag = tag_base_query.first()

    if tag is None:
        raise

    db_item = TodoItemTagAssociation(todo_id=association.todo_id, tag_id=tag.id)
    db.add(db_item)

    db.commit()
    return tag


def detach_tag_from_todo(db: Session, tag_name: str, todo_id: int, user_id: int):
    validate_todo_item_belongs_to_user(db, todo_id, user_id, [Permission.DELETE_TAG])
    validate_tag_belongs_to_user_in_todo_by_name(
        db, tag_name, todo_id, user_id, [Permission.DELETE_TAG]
    )

    db_item = (
        db.query(Tag)
        .join(Tag.todos)
        .filter(Tag.name == tag_name, TodoItem.id == todo_id)
        .first()
    )
    if not db_item:
        raise

    affected_columns = (
        db.query(TodoItemTagAssociation)
        .filter(
            TodoItemTagAssociation.todo_id == todo_id,
            TodoItemTagAssociation.tag_id == db_item.id,
        )
        .delete()
    )

    if affected_columns == 0:
        raise UserFriendlyError(
            ErrorCode.TAG_NOT_FOUND, "this tag doesn't exist for this todo"
        )

    db.commit()


def validate_tag_belongs_to_user_in_project_by_name(
    db: Session,
    tag_name: str,
    project_id: int | None,
    user_id: int,
    permissions: PermissionsType,
):
    query = (
        db.query(Tag)
        .join(Tag.project)
        .join(Project.users)
        .filter(User.id == user_id)
        .filter(Tag.name == tag_name)
    )

    if project_id is not None:
        query = query.filter(Tag.project_id == project_id)

    query = join_with_permission_query_if_required(query, permissions)

    validate_item_exists_with_permissions(
        query,
        permissions,
        ErrorCode.TAG_NOT_FOUND,
        "tag not found or doesn't belong to user or you don't have the permission to perform the requested action",
    )


def validate_tag_belongs_to_user_in_todo_by_name(
    db: Session,
    tag_name: str,
    todo_id: int,
    user_id: int,
    permissions: PermissionsType,
):
    query = (
        db.query(TodoItem)
        .join(TodoItem.category)
        .join(TodoItem.tags)
        .join(TodoCategory.projects)
        .join(Project.users)
        .filter(User.id == user_id)
        .filter(TodoItem.id == todo_id)
        .filter(Tag.name == tag_name)
    )

    query = join_with_permission_query_if_required(query, permissions)

    validate_item_exists_with_permissions(
        query,
        permissions,
        ErrorCode.TAG_NOT_FOUND,
        "tag not found or doesn't belong to user or you don't have the permission to perform the requested action",
    )


def validate_tag_belongs_to_user_by_id(
    db: Session,
    tag_id: int,
    user_id: int,
    permissions: PermissionsType,
):
    query = (
        db.query(Tag)
        .join(Tag.project)
        .join(Project.users)
        .filter(User.id == user_id)
        .filter(Tag.id == tag_id)
    )
    query = join_with_permission_query_if_required(query, permissions)

    validate_item_exists_with_permissions(
        query,
        permissions,
        ErrorCode.TAG_NOT_FOUND,
        "tag not found or doesn't belong to user or you don't have the permission to perform the requested action",
    )
