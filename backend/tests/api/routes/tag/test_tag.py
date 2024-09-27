from collections.abc import Callable

from httpx import Response

from db.models.todo_item import TodoItem
from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.tag import Tag
from db.schemas.todo_category import TodoCategory
from tests.api.conftest import TestUserType


def test_create_todo_tag(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    create_todo_item: Callable[[TestUserType, int], TodoItem],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    attach_tag_to_todo: Callable[[TestUserType, int, int, str], Response],
    test_users: list[TestUserType],
):
    user_a = test_users[0]
    user_b = test_users[1]
    user_c = test_users[2]

    # Create projects and a category under project_one
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)

    # Share project_one with user_b with CREATE_TAG permission
    attach_project_to_user(user_a, user_b, project_one.id, [Permission.CREATE_TAG])

    # Create a todo item under project_one
    todo_item = create_todo_item(user_a, category.id)

    # Owner should be able to create a tag
    response = attach_tag_to_todo(user_a, project_one.id, todo_item.id, "test tag")
    assert (
        response.status_code == 200
    ), "User A should be able to create a tag as the owner"

    # User B (with access) tries to create a tag
    response = attach_tag_to_todo(user_b, project_one.id, todo_item.id, "test tag2")
    assert (
        response.status_code == 200
    ), "User B should be able to create a tag with the correct permission"

    # User C (no access) tries to create a tag
    response = attach_tag_to_todo(user_c, project_one.id, todo_item.id, "test tag3")
    assert (
        response.status_code == 400
    ), "User C should not be able to create a tag without access"


def test_remove_todo_tag(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    create_todo_item: Callable[[TestUserType, int], TodoItem],
    get_all_permissions_except: Callable[[list[Permission]], list[Permission]],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    attach_tag_to_todo: Callable[[TestUserType, int, int, str], Response],
    detach_tag_from_todo: Callable[[TestUserType, int, str], Response],
    test_users: list[TestUserType],
):
    user_a = test_users[0]
    user_b = test_users[1]
    user_c = test_users[2]

    # Create projects and a category under project_one
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)

    # Share project_one with user_b with CREATE_TAG permission
    attach_project_to_user(
        user_a,
        user_b,
        project_one.id,
        get_all_permissions_except([Permission.DELETE_TAG]),
    )

    # Create a todo item under project_one
    todo_item = create_todo_item(user_a, category.id)

    # User B creates a tag
    create_response = attach_tag_to_todo(
        user_b, project_one.id, todo_item.id, "test tag"
    )
    created_tag = Tag.model_validate(create_response.json(), strict=True)

    # User C (no access) tries to remove the tag
    response = detach_tag_from_todo(user_c, todo_item.id, created_tag.name)
    assert (
        response.status_code == 400
    ), "User C should not be able to remove a tag without access"

    # User B (with access, but not remove permission) tries to remove the tag
    response = detach_tag_from_todo(user_b, todo_item.id, created_tag.name)
    assert (
        response.status_code == 400
    ), "User B should not be able to remove the tag without remove permission"

    # User A (owner) removes the tag
    response = detach_tag_from_todo(user_a, todo_item.id, created_tag.name)
    assert response.status_code == 200, "User A should be able to remove the tag"

    attach_project_to_user(user_a, user_c, project_one.id, [Permission.DELETE_TAG])

    other_tag_response = attach_tag_to_todo(
        user_a, project_one.id, todo_item.id, "test tag"
    )
    assert (
        other_tag_response.status_code == 200
    ), "Owner should be able to create the same tag again"

    response = detach_tag_from_todo(
        user_c,
        todo_item.id,
        Tag.model_validate(other_tag_response.json(), strict=True).name,
    )
    assert response.status_code == 200, "User C now should be able to remove the tag"
