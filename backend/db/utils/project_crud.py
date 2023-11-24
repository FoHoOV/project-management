from sqlalchemy.exc import IntegrityError
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.user import User
from db.schemas.project import (
    ProjectAttachAssociation,
    ProjectCreate,
    ProjectDetachAssociation,
    ProjectRead,
)
from sqlalchemy.orm import Session
from db.utils.exceptions import UserFriendlyError


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

    association_db = ProjectUserAssociation(
        user_id=user.id, project_id=association.project_id
    )

    try:
        db.add(association_db)
        db.commit()
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

    db.commit()

    if (
        db.query(ProjectUserAssociation)
        .filter(ProjectUserAssociation.project_id == association.project_id)
        .count()
        == 0
    ):
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
