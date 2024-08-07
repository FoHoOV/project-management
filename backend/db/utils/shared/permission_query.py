import typing

from sqlalchemy import and_
from sqlalchemy.orm import Query

from db.models.base import Base
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.user_project_permission import Permission, UserProjectPermission
from error.exceptions import ErrorCode, UserFriendlyError

PermissionsType = typing.Sequence[Permission | set[Permission]] | None


def join_with_permission_query_if_required[
    T: Base
](query: Query[T], permissions: PermissionsType):
    """join the the current query with a permissions query

    :param permissions: takes an array of permissions, for example: 1- has A and B = [A, B], 2- has (A or B) and C = [{A, B}, C]
    Return: a new query with permissions query joined with it
    """

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


def validate_item_exists_with_permissions(
    query: Query,
    permissions: PermissionsType,
    error_code: ErrorCode,
    error_message: str,
):
    if query.count() < (len(permissions) if permissions is not None else 1):
        raise UserFriendlyError(
            error_code,
            error_message,
        )
