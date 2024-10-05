from collections.abc import Callable

import pytest
from httpx import Response

from api.routes.error import UserFriendlyErrorSchema
from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from error.exceptions import ErrorCode
from tests.api.conftest import UserType


def test_create_todo_item_in_invalid_category(
    create_todo_item_request: Callable[[UserType, int], Response],
    test_users: list[UserType],
):
    user_a = test_users[0]

    # Attempt to create a todo item in a non-existent category
    response = create_todo_item_request(user_a, -1)
    assert (
        response.status_code == 400
    ), "Expected failure when creating a todo item in a non-existent category"

    parsed_error = UserFriendlyErrorSchema.model_validate(response.json())
    assert (
        parsed_error.code == ErrorCode.TODO_CATEGORY_NOT_FOUND
    ), "Expected TODO_CATEGORY_NOT_FOUND error"


@pytest.mark.parametrize("number_of_todos_to_create", [10])
def test_list_all_todos(
    create_project: Callable[[UserType], Project],
    create_todo_category: Callable[[UserType, int], TodoCategory],
    create_todo_item: Callable[[UserType, int], TodoItem],
    list_todo_items_request: Callable[[UserType, int, int], Response],
    test_users: list[UserType],
    number_of_todos_to_create: int,
):
    user_a = test_users[0]

    # Setup: Create project, category, and todos
    project = create_project(user_a)
    category = create_todo_category(user_a, project.id)

    for _ in range(number_of_todos_to_create):
        create_todo_item(user_a, category.id)

    # List all todos
    response = list_todo_items_request(user_a, project.id, category.id)
    assert response.status_code == 200, "Failed to list TODOs"

    todos = response.json()
    assert (
        len(todos) == number_of_todos_to_create
    ), f"Expected {number_of_todos_to_create} TODOs, but got {len(todos)}"

    # Verify default sort order
    parsed_todos = [TodoItem.model_validate(x, strict=True) for x in todos]
    for i, parsed_todo in enumerate(parsed_todos):
        if i == len(parsed_todos) - 1:
            assert parsed_todo.order.left_id is None
        else:
            assert (
                parsed_todo.order.left_id == parsed_todos[i + 1].id
            ), "todos should be sorted from oldest to newest"
        if i > 0:
            assert (
                parsed_todo.order.right_id == parsed_todos[i - 1].id
            ), "todos should be sorted from oldest to newest"


@pytest.mark.parametrize("number_of_todos_to_create", [10])
def test_reorder_todos(
    create_project: Callable[[UserType], Project],
    create_todo_category: Callable[[UserType, int], TodoCategory],
    create_todo_item: Callable[[UserType, int], TodoItem],
    list_todo_items: Callable[[UserType, int, int], list[TodoItem]],
    update_todo_item_order_request: Callable[
        [UserType, int, int | None, int | None, int | None], Response
    ],
    test_users: list[UserType],
    number_of_todos_to_create: int,
):
    user = test_users[0]  # Assuming the first user is used for this test

    # Create a project
    project = create_project(user)

    # Add a category to the newly created project
    category = create_todo_category(user, project.id)

    # Add todos to the created category
    for _ in range(number_of_todos_to_create):
        create_todo_item(user, category.id)

    # Query all todos for this category to get their initial order
    response_before_reorder = list_todo_items(user, project.id, category.id)

    # Reorder todos: move the last item to be the first
    reorder_response = update_todo_item_order_request(
        user,
        response_before_reorder[0].id,
        None,
        response_before_reorder[-1].id,
        category.id,
    )

    assert reorder_response.status_code == 200, "Failed to reorder todos"

    # Query all todos again to check the new order
    parsed_todos_after_reorder = list_todo_items(user, project.id, category.id)

    # Assertions to verify the new order
    assert (
        parsed_todos_after_reorder[-1].order.right_id
        == parsed_todos_after_reorder[-2].id
    ), "after reorder, newest todo should still be on the left-side of the second newest todo"
    assert (
        parsed_todos_after_reorder[-1].order.left_id == parsed_todos_after_reorder[0].id
    ), "after reorder, newest todo must on the right-side of the oldest todo"
    assert (
        parsed_todos_after_reorder[0].order.right_id
        == parsed_todos_after_reorder[-1].id
    ), "after reorder, oldest todo must be on left-side of the newest todo"
    assert (
        parsed_todos_after_reorder[0].order.left_id == None
    ), "after reorder, oldest todo must be the first one in the list"


def test_todo_item_permissions(
    create_project: Callable[[UserType], Project],
    create_todo_category: Callable[[UserType, int], TodoCategory],
    create_todo_item: Callable[[UserType, int], TodoItem],
    attach_project_to_user: Callable[[UserType, UserType, int, list[Permission]], None],
    update_todo_item_done_status_request: Callable[[UserType, int, bool], Response],
    delete_todo_item_request: Callable[[UserType, int], Response],
    test_users: list[UserType],
):
    user_a = test_users[0]
    user_b = test_users[1]
    user_c = test_users[2]

    # Setup: Create project, category, and todo item
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)
    todo_item = create_todo_item(user_a, category.id)

    # Attach project to user B with specific permission
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_ITEM]
    )

    # Test: User B tries to delete the todo item (should fail)
    response = delete_todo_item_request(user_b, todo_item.id)
    assert (
        response.status_code == 400
    ), "User B shouldn't be able to delete the todo item"

    # Test: User B updates the todo item (should succeed)
    response = update_todo_item_done_status_request(user_b, todo_item.id, True)
    assert response.status_code == 200, "User B should be able to update the todo item"

    # Test: User C (no access) tries to update the todo item (should fail)
    response = update_todo_item_done_status_request(user_c, todo_item.id, False)
    assert (
        response.status_code == 400
    ), "User C shouldn't be able to update the todo item"

    # Test: User C (no access) tries to delete the todo item (should fail)
    response = delete_todo_item_request(user_c, todo_item.id)
    assert (
        response.status_code == 400
    ), "User C shouldn't be able to delete the todo item"

    # Test: User A (owner) deletes the todo item (should succeed)
    response = delete_todo_item_request(user_a, todo_item.id)
    assert response.status_code == 200, "User A should be able to delete the todo item"


def test_todo_item_done_status_changes(
    create_project: Callable[[UserType], Project],
    create_todo_category: Callable[[UserType, int], TodoCategory],
    create_todo_item: Callable[[UserType, int], TodoItem],
    attach_project_to_user: Callable[[UserType, UserType, int, list[Permission]], None],
    update_todo_item_done_status: Callable[[UserType, int, bool], TodoItem],
    update_todo_item_done_status_request: Callable[[UserType, int, bool], Response],
    test_users: list[UserType],
):
    user_a = test_users[0]
    user_b = test_users[1]

    # Setup: Create project, category, and todo item
    project_one = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)
    todo_item = create_todo_item(user_a, category.id)

    # Attach project to user B with specific permission
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_ITEM]
    )

    update_todo_item_done_status(user_b, todo_item.id, True)
    # changing the permission to the same thing should be ok
    update_todo_item_done_status(user_b, todo_item.id, True)

    response = update_todo_item_done_status_request(user_a, todo_item.id, False)
    assert (
        response.status_code == 400
    ), "user_a cannot change todo done status its already marked as done by user_b"

    # user_b marking this as done so other can mark is as done afterwards
    update_todo_item_done_status(user_b, todo_item.id, False)

    # now user_a should be able to update it
    update_todo_item_done_status(user_a, todo_item.id, True)
