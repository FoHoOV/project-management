from fastapi.testclient import TestClient
from api.test import TEST_USERS, get_access_token, app
from db.models.user_project_permission import Permission
from db.schemas.project import Project


client = TestClient(app)


def test_create_project_without_template():
    response = client.post(
        "/project/create",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={"title": "test", "description": "test"},
    )

    assert response.status_code == 200

    project = Project.model_validate(response.json(), strict=True)

    assert (
        len(project.users) == 1
    ), "new project should be associated to only one user (the creator of this project)"

    assert (
        project.users[0].username == TEST_USERS[0]["username"]
    ), "owner of the created project should be the user who created it"

    assert (
        len(project.todo_categories) == 0
    ), "an empty project should have no categories"
    assert project.done_todos_count == 0, "an empty project should have no done todos"

    assert (
        project.pending_todos_count == 0
    ), "an empty project should have no pending todos"


def test_create_project_with_template():
    response = client.post(
        "/project/create",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "title": "test",
            "description": "test",
            "create_from_default_template": True,
        },
    )

    assert response.status_code == 200

    project = Project.model_validate(response.json(), strict=True)

    assert (
        len(project.users) == 1
    ), "new project should be associated to only one user (the creator of this project)"

    assert (
        project.users[0].username == TEST_USERS[0]["username"]
    ), "owner of the created project should be the user who created it"

    assert (
        len(project.todo_categories) == 4
    ), "a new project made from the template should have 4 categories"

    assert (
        project.done_todos_count == 0
    ), "a new project made from the template should have no done todos"

    assert (
        project.pending_todos_count == 0
    ), "a new project made from the template should have no pending todos"


def test_user_a_cannot_access_user_b_project_if_not_shared():
    response = client.post(
        "/project/create",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={"title": "test", "description": "test"},
    )

    assert response.status_code == 200

    project = Project.model_validate(response.json(), strict=True)

    response = client.get(
        f"/project/search?project_id={project.id}",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
    )

    assert (
        response.status_code == 200
    ), "owner of project should be able to search their own project"

    response = client.get(
        f"/project/search?project_id={project.id}",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 400
    ), "user b can see user a's projects even though it is not shared"


def test_user_a_can_access_user_b_project_if_shared():
    response = client.post(
        "/project/create",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={"title": "test", "description": "test"},
    )

    assert response.status_code == 200

    project = Project.model_validate(response.json(), strict=True)

    response = client.post(
        "/project/attach-to-user",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "project_id": project.id,
            "username": TEST_USERS[1]["username"],
            "permissions": [Permission.ALL],
        },
    )

    assert (
        response.status_code == 200
    ), "owner of a project should be able to share it with someone else"

    response = client.get(
        f"/project/search?project_id={project.id}",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 200
    ), "user b should be able to see user a's project because it was shared"
