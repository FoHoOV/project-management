import typing
from sqlalchemy import and_
from db.models.base import Base
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.user_project_permission import Permission, UserProjectPermission
from sqlalchemy.orm import Query


def join_with_permission_query_if_required[
    T: Base
](query: Query[T], permissions: typing.Sequence[Permission | set[Permission]] | None):
    if permissions is None:
        return query

    expanded_permissions: list[Permission] = []
    for permission in permissions:
        if isinstance(permission, Permission):
            expanded_permissions.append(permission)
            continue
        expanded_permissions.extend(typing.cast(tuple[Permission], permission))

    if len(expanded_permissions) == 0:
        raise Exception(
            "expanded_permissions length cannot be empty, did meant to pass None?"
        )

    if any(permission == Permission.ALL for permission in expanded_permissions):
        expanded_permissions = [Permission.ALL]

    if any(permission != Permission.ALL for permission in expanded_permissions):
        expanded_permissions = expanded_permissions + [Permission.ALL]

    # TODO: THERE SHOULD BE A BETTER WAY, but the purpose is that the query should already be joined with Projects table
    # because if its not we are not sure whose expanded_permissions we are checking
    if not any(joins[0].parent.entity == Project for joins in query._setup_joins):  # type: ignore
        raise Exception("query should be already joined with Project table")

    # TODO: THERE SHOULD BE A BETTER WAY, but the purpose is that the query should not already be joined with UserProjectPermission table
    # otherwise we would be joining to UserProjectPermission table twice
    if any(
        joins[0].parent.entity == UserProjectPermission for joins in query._setup_joins  # type: ignore
    ):
        raise Exception("query is already joined with UserProjectPermission")

    query = query.join(ProjectUserAssociation.permissions).filter(
        UserProjectPermission.permission.in_(expanded_permissions)
    )

    return query
