from typing import Callable
from httpx import Response

from tests.api.conftest import (
    TestUserType,
)
from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.todo_item_comment import TodoComment
from db.schemas.todo_category import TodoCategory


def test_create_comment_no_access(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    create_todo_item: Callable[[TestUserType, int], TodoCategory],
    create_comment_request: Callable[[TestUserType, int, str], Response],
    get_all_permissions_except: Callable[[list[Permission]], list[Permission]],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    # Setup: Create a project, category, and todo item
    project_one = create_project(test_users[0])
    category = create_todo_category(test_users[0], project_one.id)
    todo_item = create_todo_item(test_users[0], category.id)

    attach_project_to_user(
        test_users[0],
        test_users[1],
        project_one.id,
        get_all_permissions_except([Permission.CREATE_COMMENT]),
    )

    # User without access tries to create a comment
    response = create_comment_request(test_users[1], todo_item.id, "some message")
    assert (
        response.status_code == 400
    ), "User without access should not create a comment"

    # User without access tries to create a comment
    response = create_comment_request(test_users[2], todo_item.id, "some message")
    assert (
        response.status_code == 400
    ), "User without access should not create a comment"


def test_create_comment_with_access(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    create_todo_item: Callable[[TestUserType, int], TodoCategory],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    create_comment_request: Callable[[TestUserType, int, str], Response],
    test_users: list[TestUserType],
):
    # Setup: Create a project, category, and todo item
    project_one = create_project(test_users[0])
    category = create_todo_category(test_users[0], project_one.id)
    todo_item = create_todo_item(test_users[0], category.id)

    # Attach project to user with permission
    attach_project_to_user(
        test_users[0], test_users[1], project_one.id, [Permission.CREATE_COMMENT]
    )

    # User with access creates a comment
    response = create_comment_request(test_users[1], todo_item.id, "some message")
    assert response.status_code == 200, "User with permission should create a comment"


def test_delete_comment_no_access(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    create_todo_item: Callable[[TestUserType, int], TodoCategory],
    create_comment: Callable[[TestUserType, int, str], TodoComment],
    delete_comment_request: Callable[[TestUserType, int, int], Response],
    get_all_permissions_except: Callable[[list[Permission]], list[Permission]],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    # Setup: Create a project, category, todo item, and a comment
    project_one = create_project(test_users[0])
    category = create_todo_category(test_users[0], project_one.id)
    todo_item = create_todo_item(test_users[0], category.id)
    todo_comment = create_comment(test_users[0], todo_item.id, "some message")

    attach_project_to_user(
        test_users[0],
        test_users[1],
        project_one.id,
        get_all_permissions_except([Permission.DELETE_COMMENT]),
    )

    # User without access tries to delete the comment
    response = delete_comment_request(test_users[1], todo_item.id, todo_comment.id)
    assert (
        response.status_code == 400
    ), "User without access should not delete a comment"

    response = delete_comment_request(test_users[2], todo_item.id, todo_comment.id)
    assert (
        response.status_code == 400
    ), "User without access should not delete a comment"


def test_delete_comment_with_access(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    create_todo_item: Callable[[TestUserType, int], TodoCategory],
    create_comment: Callable[[TestUserType, int, str], TodoComment],
    delete_comment_request: Callable[[TestUserType, int, int], Response],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    # Setup: Create a project, category, todo item, and a comment
    project_one = create_project(test_users[0])
    category = create_todo_category(test_users[0], project_one.id)
    todo_item = create_todo_item(test_users[0], category.id)
    todo_comment = create_comment(test_users[0], todo_item.id, "some message")

    # Attach project to user with permission
    attach_project_to_user(
        test_users[0], test_users[1], project_one.id, [Permission.DELETE_COMMENT]
    )

    # User with access deletes the comment
    response = delete_comment_request(test_users[1], todo_item.id, todo_comment.id)
    assert response.status_code == 200, "User with permission should delete the comment"


def test_delete_comment_by_owner(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    create_todo_item: Callable[[TestUserType, int], TodoCategory],
    create_comment: Callable[[TestUserType, int, str], TodoComment],
    delete_comment_request: Callable[[TestUserType, int, int], Response],
    test_users: list[TestUserType],
):
    # Setup: Create a project, category, todo item, and a comment
    project_one = create_project(test_users[0])
    category = create_todo_category(test_users[0], project_one.id)
    todo_item = create_todo_item(test_users[0], category.id)
    todo_comment = create_comment(test_users[0], todo_item.id, "some message")

    # Owner deletes the comment
    response = delete_comment_request(test_users[0], todo_item.id, todo_comment.id)
    assert response.status_code == 200, "Owner should be able to delete the comment"
