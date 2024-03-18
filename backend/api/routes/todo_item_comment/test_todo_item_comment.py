from typing import Callable, Dict
from fastapi.testclient import TestClient
from api.conftest import TestUserType
from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from db.schemas.todo_item_comment import TodoComment


def test_todo_comment_permissions(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_category_factory: Callable[[TestUserType, int], TodoCategory],
    test_todo_item_factory: Callable[[TestUserType, int], TodoCategory],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    # Create a project
    project_one = test_project_factory(test_users[0])
    project_two = test_project_factory(test_users[0])

    # Create a category
    category = test_category_factory(test_users[0], project_one.id)

    # Share project with user b with only edit todo permission
    test_attach_project_to_user(
        test_users[0],
        test_users[1],
        project_one.id,
        [Permission.CREATE_COMMENT],
    )
    # Share this project to user b to ensure permissions of this doesn't leak into project_one permissions
    test_attach_project_to_user(
        test_users[0],
        test_users[1],
        project_two.id,
        [
            Permission.ALL,
        ],
    )

    # Create a todo item
    todo_item = test_todo_item_factory(test_users[0], category.id)

    # Try creating a comment from a user who doesn't have access
    create_comment_response = test_client.post(
        "/todo-item/comment/create",
        headers=auth_header_factory(test_users[2]),
        json={"todo_id": todo_item.id, "message": "some message"},
    )
    assert (
        create_comment_response.status_code == 400
    ), "User without access should not create a comment"

    # Try creating a comment from a user who has access
    user_b_auth_header = auth_header_factory(test_users[1])
    create_comment_response = test_client.post(
        "/todo-item/comment/create",
        headers=user_b_auth_header,
        json={"todo_id": todo_item.id, "message": "some message"},
    )
    assert (
        create_comment_response.status_code == 200
    ), "User with permission should create a comment"

    todo_comment = TodoComment.model_validate(
        create_comment_response.json(), strict=True
    )

    # Try removing a comment from a user who doesn't have access
    delete_by_unknown_user_response = test_client.request(
        "delete",
        "/todo-item/comment/delete",
        headers=auth_header_factory(test_users[2]),
        json={"id": todo_comment.id},
    )
    assert (
        delete_by_unknown_user_response.status_code == 400
    ), "User without access should not delete a comment"

    # Removing a comment by the owner
    delete_by_owner_response = test_client.request(
        "delete",
        "/todo-item/comment/delete",
        headers=auth_header_factory(test_users[0]),
        json={"id": todo_comment.id},
    )
    assert (
        delete_by_owner_response.status_code == 200
    ), "Owner should be able to delete the comment"
