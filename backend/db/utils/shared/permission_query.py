from sqlalchemy import and_
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.user_project_permission import Permission, UserProjectPermission
from sqlalchemy.orm import Query


def join_with_permission_query_if_required[
    T
](query: Query[T], permissions: list[Permission] | None):
    if permissions is None:
        return query

    if len(permissions) == 0:
        raise Exception("permissions length cannot be empty, did meant to pass None?")

    if any(permission == Permission.ALL for permission in permissions):
        permissions = [Permission.ALL]

    if all(permission != Permission.ALL for permission in permissions):
        permissions = permissions + [Permission.ALL]

    query = (
        query.join(
            ProjectUserAssociation,
            and_(
                ProjectUserAssociation.project_id == Project.id,
                ProjectUserAssociation.user_id,
            ),
        )
        .join(ProjectUserAssociation.permissions)
        .filter(UserProjectPermission.permission.in_(permissions))
    )

    return query
