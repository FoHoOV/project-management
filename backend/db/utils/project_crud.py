import typing
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.todo_category_project_association import TodoCategoryProjectAssociation
from db.models.user import User
from db.models.user_project_permission import Permission, UserProjectPermission
from db.schemas.project import (
    ProjectAttachAssociation,
    ProjectCreate,
    ProjectDetachAssociation,
    ProjectRead,
    ProjectUpdate,
    ProjectUpdateUserPermissions,
)
from sqlalchemy.orm import Session
from db.schemas.todo_category import TodoCategoryCreate
from db.utils.shared.permission_query import (
    join_with_permission_query_if_required,
    PermissionsType,
    validate_item_exists_with_permissions,
)
from error.exceptions import ErrorCode, UserFriendlyError
from db.models.todo_category import TodoCategory


def create(db: Session, project: ProjectCreate, user_id: int):
    if db.query(User).filter(User.id == user_id).count() == 0:
        raise UserFriendlyError(
            ErrorCode.USER_NOT_FOUND, "requested user doesn't exist"
        )

    db_item = Project(**project.model_dump())
    db.add(db_item)
    db.flush()

    association = ProjectUserAssociation(user_id=user_id, project_id=db_item.id)
    db.add(association)
    db.flush()

    db.add(
        UserProjectPermission(
            project_user_association_id=association.id, permission=Permission.ALL
        )
    )
    db.flush()

    if project.create_from_default_template:
        add_default_template_categories(db, db_item.id, user_id)

    db.commit()
    return db_item


def update(db: Session, project: ProjectUpdate, user_id: int):
    db_item = get_project(db, ProjectRead(project_id=project.project_id), user_id)

    db_item.title = project.title
    db_item.description = project.description

    db.commit()
    return db_item


def update_user_permissions(
    db: Session, permissions: ProjectUpdateUserPermissions, user_id: int
):
    # check if current user is owner
    validate_project_belongs_to_user(
        db, permissions.project_id, user_id, [Permission.ALL]
    )

    # check if the user we are changing has access to this project
    try:
        validate_project_belongs_to_user(
            db, permissions.project_id, permissions.user_id, None
        )
    except UserFriendlyError as ex:
        raise UserFriendlyError(
            ErrorCode.USER_DOESNT_HAVE_ACCESS_TO_PROJECT,
            "The user that you are trying to update doesn't have access to this project or doesn't exist",
        )

    association = (
        db.query(ProjectUserAssociation)
        .filter(
            ProjectUserAssociation.project_id == permissions.project_id,
            ProjectUserAssociation.user_id == permissions.user_id,
        )
        .first()
    )

    if association is None:
        raise  # not possible, just to mute type-hints

    db.query(UserProjectPermission).filter(
        UserProjectPermission.project_user_association_id == association.id
    ).delete()

    for permission in permissions.permissions:
        db.add(
            UserProjectPermission(
                project_user_association_id=association.id, permission=permission
            )
        )

    db.commit()

    return get_project(db, ProjectRead(project_id=permissions.project_id), user_id)


def attach_to_user(db: Session, association: ProjectAttachAssociation, user_id: int):
    user = db.query(User).filter(User.username == association.username).first()
    if user is None:
        raise UserFriendlyError(
            ErrorCode.USER_NOT_FOUND, "requested user doesn't exist"
        )

    validate_project_belongs_to_user(
        db,
        association.project_id,
        user_id,
        [Permission.ALL],  # this only allows owners to be able to share the project
    )

    association_db_item = ProjectUserAssociation(
        user_id=user.id, project_id=association.project_id
    )

    try:
        db.add(association_db_item)
        db.flush()
    except IntegrityError:
        raise UserFriendlyError(
            ErrorCode.USER_ASSOCIATION_ALREADY_EXISTS,
            "this user already exists in this project's associations",
        )

    for permission in association.permissions:
        db.add(
            UserProjectPermission(
                project_user_association_id=association_db_item.id,
                permission=permission,
            )
        )

    db.commit()

    return association_db_item


def detach_from_user(db: Session, association: ProjectDetachAssociation, user_id: int):
    validate_project_belongs_to_user(
        db,
        association.project_id,
        user_id,
        [Permission.ALL] if association.user_id is not None else None,
    )

    target_user_id = association.user_id if association.user_id is not None else user_id

    if target_user_id != user_id:
        validate_project_belongs_to_user(
            db, association.project_id, target_user_id, None
        )

    db.query(ProjectUserAssociation).filter(
        ProjectUserAssociation.project_id == association.project_id,
        ProjectUserAssociation.user_id == target_user_id,
    ).delete()

    if (
        db.query(ProjectUserAssociation)
        .filter(ProjectUserAssociation.project_id == association.project_id)
        .count()
        == 0
    ):
        delete_project(db, association.project_id)

    db.commit()


def delete_project(db: Session, project_id: int):
    # the validation that this project belongs to user is callers responsibility
    categories_with_one_or_less_bound_projects = (
        db.query(
            TodoCategoryProjectAssociation.category_id,
        )
        .group_by(TodoCategoryProjectAssociation.category_id)
        .having(func.count(TodoCategoryProjectAssociation.category_id) <= 1)
    )

    categories_with_deleting_project_id = (
        db.query(TodoCategoryProjectAssociation.category_id)
        .filter(
            TodoCategoryProjectAssociation.project_id == project_id,
            TodoCategoryProjectAssociation.category_id.in_(
                categories_with_one_or_less_bound_projects
            ),
        )
        .all()
    )
    db.query(TodoCategory).filter(
        TodoCategory.id.in_(
            [row.tuple()[0] for row in categories_with_deleting_project_id]
        )
    ).delete()

    db.query(Project).filter(Project.id == project_id).delete()

    db.commit()


def get_project(db: Session, project: ProjectRead, user_id: int):
    result = get_projects(db, user_id, project.project_id)

    if len(result) == 0:
        raise UserFriendlyError(
            ErrorCode.PROJECT_NOT_FOUND,
            "project doesn't exist or doesn't belong to current user",
        )

    return result[0]


def get_projects(db: Session, user_id: int, project_id: int | None = None):
    query = db.query(Project).join(Project.users).filter(User.id == user_id)

    if project_id is not None:
        query = query.filter(Project.id == project_id)

    return query.order_by(Project.id.asc()).all()


def add_default_template_categories(db: Session, project_id: int, user_id: int):
    from .todo_category_crud import create as create_category

    default_categories = [
        {"title": "Pending", "description": "⌚"},
        {"title": "Working on it", "description": "⚒️"},
        {"title": "Stuck", "description": "😡"},
        {"title": "Done", "description": "✅"},
    ]

    for category in default_categories:
        create_category(
            db,
            TodoCategoryCreate.model_validate({**category, "project_id": project_id}),
            user_id,
        )
    db.commit()


def validate_project_belongs_to_user(
    db: Session,
    project_id: int,
    user_id: int,
    permissions: PermissionsType,
):
    query = (
        db.query(Project)
        .filter(Project.id == project_id)
        .join(Project.users)
        .filter(User.id == user_id)
    )

    query = join_with_permission_query_if_required(query, permissions)

    validate_item_exists_with_permissions(
        query,
        permissions,
        ErrorCode.PROJECT_NOT_FOUND,
        "project doesn't exist or doesn't belong to user or you don't have the permission to perform the requested action",
    )
