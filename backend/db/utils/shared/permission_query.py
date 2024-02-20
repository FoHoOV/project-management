from sqlalchemy import and_
from db.models.base import Base
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.user_project_permission import Permission, UserProjectPermission
from sqlalchemy.orm import Query


def join_with_permission_query_if_required[
    T: Base
](query: Query[T], permissions: list[Permission] | None):
    if permissions is None:
        return query

    if len(permissions) == 0:
        raise Exception("permissions length cannot be empty, did meant to pass None?")

    if any(permission == Permission.ALL for permission in permissions):
        permissions = [Permission.ALL]

    if all(permission != Permission.ALL for permission in permissions):
        permissions = permissions + [Permission.ALL]

    query = query.filter(UserProjectPermission.permission.in_(permissions))

    return query
