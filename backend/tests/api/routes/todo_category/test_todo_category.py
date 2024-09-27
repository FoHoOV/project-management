from collections.abc import Callable

from httpx import Response

from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.todo_category import TodoCategory
from tests.api.conftest import TestUserType


def test_todo_category_create_with_permission(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create a project
    project_one = create_project(user_a)

    # Share project_one with user_b with CREATE_TODO_CATEGORY permission
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.CREATE_TODO_CATEGORY]
    )

    # User B creates a todo category
    category = create_todo_category(user_b, project_one.id)
    assert category, "User B should be able to create a todo category with permission"


def test_todo_category_create_no_permission(
    create_project: Callable[[TestUserType], Project],
    create_todo_category_request: Callable[[TestUserType, int], Response],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    get_all_permissions_except: Callable[[list[Permission]], list[Permission]],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with other permissions

    # Create a project
    project_one = create_project(user_a)

    # Share project_one with user_b without CREATE_TODO_CATEGORY permission
    attach_project_to_user(
        user_a,
        user_b,
        project_one.id,
        get_all_permissions_except([Permission.CREATE_TODO_CATEGORY]),
    )

    # User B tries to create a todo category
    response = create_todo_category_request(user_b, project_one.id)
    assert (
        response.status_code == 400
    ), "User B should not be able to create a todo category without permission"


def test_todo_category_update_with_permission(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    update_todo_category_request: Callable[[TestUserType, int, str], Response],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create a project and a category
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)

    # Share project_one with user_b with UPDATE_TODO_CATEGORY permission
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    # User B updates the category
    response = update_todo_category_request(user_b, category.id, "Updated Title")
    assert (
        response.status_code == 200
    ), "User B should be able to update the category with permission"


def test_todo_category_update_no_permission(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    get_all_permissions_except: Callable[[list[Permission]], list[Permission]],
    update_todo_category_request: Callable[[TestUserType, int, str], Response],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user without update permission

    # Create a project and a category
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)

    # Share project_one with user_b without UPDATE_TODO_CATEGORY permission
    attach_project_to_user(
        user_a,
        user_b,
        project_one.id,
        get_all_permissions_except([Permission.UPDATE_TODO_CATEGORY]),
    )

    # User B tries to update the category
    response = update_todo_category_request(user_b, category.id, "Updated Title")
    assert (
        response.status_code == 400
    ), "User B should not be able to update the category without permission"


def test_todo_category_delete_by_owner(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    delete_todo_category_request: Callable[[TestUserType, int, int], Response],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner

    # Create a project and a category
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)

    # Owner deletes the category
    response = delete_todo_category_request(user_a, category.id, project_one.id)
    assert response.status_code == 200, "Owner should be able to delete the category"


def test_todo_category_delete_no_permission(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    get_all_permissions_except: Callable[[list[Permission]], list[Permission]],
    delete_todo_category_request: Callable[[TestUserType, int, int], Response],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user without delete permission

    # Create a project and a category
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)

    # Share project_one with user_b without DELETE_TODO_CATEGORY permission
    attach_project_to_user(
        user_a,
        user_b,
        project_one.id,
        get_all_permissions_except([Permission.DELETE_TODO_CATEGORY]),
    )

    # User B tries to delete the category
    response = delete_todo_category_request(user_b, category.id, project_one.id)
    assert (
        response.status_code == 400
    ), "User B should not be able to delete the category without permission"
