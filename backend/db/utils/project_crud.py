from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.todo_category_order import TodoCategoryOrder
from db.models.todo_category_project_association import TodoCategoryProjectAssociation
from db.models.todo_item import TodoItem
from db.models.user import User
from db.schemas.project import (
    ProjectAttachAssociation,
    ProjectCreate,
    ProjectDetachAssociation,
    ProjectRead,
)
from sqlalchemy.orm import Session
from db.utils.exceptions import UserFriendlyError
from db.models.todo_category import TodoCategory


def create(db: Session, project: ProjectCreate, user_id: int):
    if db.query(User).filter(User.id == user_id).count() == 0:
        raise UserFriendlyError("requested user doesn't exist")

    db_item = Project(**project.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    association = ProjectUserAssociation(user_id=user_id, project_id=db_item.id)
    db.add(association)
    db.commit()

    return db_item


def attach_to_user(db: Session, association: ProjectAttachAssociation, user_id: int):
    user = db.query(User).filter(User.username == association.username).first()
    if user is None:
        raise UserFriendlyError("requested user doesn't exist")

    validate_project_belongs_to_user(
        db,
        association.project_id,
        user_id,
        user_id,
        True,
    )

    association_db_item = ProjectUserAssociation(
        user_id=user.id, project_id=association.project_id
    )

    try:
        db.add(association_db_item)
        db.commit()
        db.refresh(association_db_item)
        return association_db_item
    except IntegrityError:
        raise UserFriendlyError(
            "this user already exists in this project's associations"
        )


def detach_from_user(db: Session, association: ProjectDetachAssociation, user_id: int):
    validate_project_belongs_to_user(
        db,
        association.project_id,
        user_id,
        user_id,
        True,
    )

    db.query(ProjectUserAssociation).filter(
        ProjectUserAssociation.project_id == association.project_id,
        ProjectUserAssociation.user_id == user_id,
    ).delete()

    if (
        db.query(ProjectUserAssociation)
        .filter(ProjectUserAssociation.project_id == association.project_id)
        .count()
        == 0
    ):
        # TODO: so what the fuck delete on cascade is for?? what da fak??
        # it doesn't work if i dont delete them myself! :|

        categories_with_deleting_project_id_subquery = (
            db.query(TodoCategory.id, TodoCategoryProjectAssociation.project_id)
            .join(
                TodoCategoryProjectAssociation,
                TodoCategory.id == TodoCategoryProjectAssociation.category_id,
            )
            .group_by(TodoCategory.id)
            .having(func.count(TodoCategoryProjectAssociation.category_id) == 1)
            .subquery()
        )

        categories_with_deleting_project_id = (
            db.query(categories_with_deleting_project_id_subquery.c.id)
            .filter(
                categories_with_deleting_project_id_subquery.c.project_id
                == association.project_id
            )
            .all()
        )

        db.query(TodoCategoryProjectAssociation).filter(
            TodoCategoryProjectAssociation.project_id == association.project_id
        ).delete()

        db.query(TodoCategory).filter(
            TodoCategory.id.in_(
                [row.tuple()[0] for row in categories_with_deleting_project_id]
            )
        ).delete()

        db.query(Project).filter(Project.id == association.project_id).delete()

    db.commit()


def get_project(db: Session, project: ProjectRead, user_id: int):
    result = (
        db.query(Project)
        .filter(Project.id == project.project_id)
        .join(Project.users)
        .filter(User.id == user_id)
        .first()
    )

    if result is None:
        raise UserFriendlyError(
            "project doesn't exist or doesn't belong to current user"
        )

    return result


def get_projects(db: Session, user_id: int):
    result = db.query(Project).join(Project.users).filter(User.id == user_id).all()

    return result


def validate_project_belongs_to_user(
    db: Session,
    project_id: int,
    inquired_user_id: int,
    current_user_id: int,
    pass_current_user_validations: bool = False,
):
    if (
        not pass_current_user_validations
        and db.query(ProjectUserAssociation)
        .filter(
            ProjectUserAssociation.user_id == current_user_id,
            ProjectUserAssociation.project_id == project_id,
        )
        .count()
        == 0
    ):
        raise UserFriendlyError(
            "project doesn't exist or doesn't belong to current user"
        )

    if (
        db.query(ProjectUserAssociation)
        .filter(
            ProjectUserAssociation.user_id == inquired_user_id,
            ProjectUserAssociation.project_id == project_id,
        )
        .count()
        == 0
    ):
        raise UserFriendlyError("project doesn't exist or doesn't belong to user")
