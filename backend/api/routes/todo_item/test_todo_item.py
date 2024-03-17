from typing import Callable, Dict
from fastapi.testclient import TestClient
import pytest
from api.conftest import TestUserType
from api.routes.error import UserFriendlyErrorSchema
from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from db.schemas.todo_item_comment import TodoComment
from error.exceptions import ErrorCode


def test_create_todo_item_not_belonging_to_user(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    # This test attempts to create a todo item in a non-existent category
    # and expects to fail with a specific error code indicating the category was not found.

    # Generate authorization header for the first test user
    headers = auth_header_factory(test_users[0])

    # Attempt to create a todo item with an invalid category ID
    response = test_client.post(
        "/todo-item/create",
        headers=headers,
        json={
            "title": "test",
            "description": "test",
            "is_done": False,
            "category_id": -1,  # Assuming -1 is an invalid category ID
        },
    )

    # Validate the response
    assert (
        response.status_code == 400
    ), "Expected failure when creating todo item in a non-existent category"

    parsed_create_todo_error = UserFriendlyErrorSchema.model_validate(response.json())
    assert (
        parsed_create_todo_error.code == ErrorCode.TODO_CATEGORY_NOT_FOUND
    ), "Expected TODO_CATEGORY_NOT_FOUND error when inserting into a category that does not exist"


@pytest.mark.parametrize("number_of_todos_to_create", [10])
def test_list_all_todos(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_category_factory: Callable[[TestUserType, int], TodoCategory],
    test_todo_item_factory: Callable[[TestUserType, int], TodoCategory],
    test_users: list[TestUserType],
    test_client: TestClient,
    number_of_todos_to_create: int,
):
    # Selecting a test user
    user = test_users[0]
    auth_header = auth_header_factory(user)

    # Creating a project
    project = test_project_factory(user)

    # Adding a category to the newly created project
    category = test_category_factory(user, project.id)

    # Adding TODOs to the created category
    for i in range(number_of_todos_to_create):
        test_todo_item_factory(user, category.id)

    # Querying all TODOs for this category
    response = test_client.get(
        "/todo-item/list",
        params={"project_id": project.id, "category_id": category.id},
        headers=auth_header,
    )

    assert response.status_code == 200, "Failed to list TODOs"
    todos = response.json()
    assert (
        len(todos) == number_of_todos_to_create
    ), f"Expected {number_of_todos_to_create} TODOs, but got {len(todos)}"

    # convert them to TodoItem model
    parsed_todos = [TodoItem.model_validate(x, strict=True) for x in todos]

    # testing default sort
    for i, parsed_todo in enumerate(parsed_todos):
        if i == len(parsed_todos) - 1:
            assert parsed_todo.order.left_id is None
        else:
            assert (
                parsed_todo.order.left_id == parsed_todos[i + 1].id
            ), "todo items should by default be sorted from oldest to newest"

        if i > 0:
            assert (
                parsed_todo.order.right_id == parsed_todos[i - 1].id
            ), "todo items should by default be sorted from oldest to newest"


@pytest.mark.parametrize("number_of_todos_to_create", [10])
def test_reorder_todos(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_category_factory: Callable[[TestUserType, int], TodoCategory],
    test_todo_item_factory: Callable[[TestUserType, int], TodoItem],
    test_users: list[TestUserType],
    test_client: TestClient,
    number_of_todos_to_create: int,
):
    user = test_users[0]  # Assuming the first user is used for this test

    # Create a project
    project = test_project_factory(user)

    # Add a category to the newly created project
    category = test_category_factory(user, project.id)

    # Add todos to the created category
    for i in range(number_of_todos_to_create):
        test_todo_item_factory(user, category.id)

    # Query all todos for this category to get their initial order
    response_before_reorder = test_client.get(
        "/todo-item/list",
        params={"project_id": project.id, "category_id": category.id},
        headers=auth_header_factory(user),
    )
    parsed_todos_before_reorder = [
        TodoItem.model_validate(x, strict=True) for x in response_before_reorder.json()
    ]

    # Reorder todos: move the last item to be the first
    reorder_response = test_client.patch(
        "/todo-item/update-order",
        json={
            "id": parsed_todos_before_reorder[0].id,
            "left_id": None,
            "right_id": parsed_todos_before_reorder[-1].id,
            "new_category_id": category.id,
        },
        headers=auth_header_factory(user),
    )
    assert reorder_response.status_code == 200, "Failed to reorder todos"

    # Query all todos again to check the new order
    response_after_reorder = test_client.get(
        "/todo-item/list",
        params={"project_id": project.id, "category_id": category.id},
        headers=auth_header_factory(user),
    )

    parsed_todos_after_reorder = [
        TodoItem.model_validate(x, strict=True) for x in response_after_reorder.json()
    ]

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
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_category_factory: Callable[[TestUserType, int], TodoCategory],
    test_todo_item_factory: Callable[[TestUserType, int], TodoItem],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission
    user_c = test_users[2]  # User without access

    # Create two projects and add a category to the first one
    project_one = test_project_factory(user_a)
    project_two = test_project_factory(user_a)
    category = test_category_factory(user_a, project_one.id)

    # Share project_one with user_b with UPDATE_TODO_ITEM permission
    test_attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_ITEM]
    )

    # Share project_two with user_b with ALL permissions
    test_attach_project_to_user(
        user_a,
        user_b,
        project_two.id,
        [Permission.ALL],
    )

    # Create a todo item in project_one's category
    todo_item = test_todo_item_factory(user_a, category.id)

    # Try deleting the todo item by user_b (should fail due to insufficient permission)
    response = test_client.request(
        "delete",
        "/todo-item/delete",
        headers=auth_header_factory(user_b),
        json={"id": todo_item.id},
    )
    assert (
        response.status_code == 400
    ), "User B (shared with UPDATE_TODO_ITEM permission) shouldn't be able to delete the todo item"

    # Update the todo item by user_b (should succeed because of UPDATE_TODO_ITEM permission)
    response = test_client.patch(
        "/todo-item/update-item",
        headers=auth_header_factory(user_b),
        json={
            "id": todo_item.id,
            "category_id": todo_item.category_id,
            "is_done": True,
        },
    )
    assert (
        response.status_code == 200
    ), "User B (with permission) should be able to update the todo item"

    # Try updating the todo item by user_c (should fail because the project is not shared with them)
    response = test_client.patch(
        "/todo-item/update-item",
        headers=auth_header_factory(user_c),
        json={
            "id": todo_item.id,
            "category_id": todo_item.category_id,
            "is_done": False,
        },
    )
    assert (
        response.status_code == 400
    ), "User C (not shared) should not be able to update the todo item"

    # Try deleting the todo item by user_c (should fail because the project is not shared with them)
    response = test_client.request(
        "delete",
        "/todo-item/delete",
        headers=auth_header_factory(user_c),
        json={"id": todo_item.id},
    )
    assert (
        response.status_code == 400
    ), "User C (not shared) should not be able to delete the todo item"

    # Delete the todo item by user_a (owner) (should succeed)
    response = test_client.request(
        "delete",
        "/todo-item/delete",
        headers=auth_header_factory(user_a),
        json={"id": todo_item.id},
    )
    assert (
        response.status_code == 200
    ), "User A (owner) should be able to delete the todo item"
