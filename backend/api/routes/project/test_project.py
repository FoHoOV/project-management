from fastapi.testclient import TestClient
from api.test import TEST_USER, get_access_token, app
from db.schemas.project import Project


client = TestClient(app)


def test_create_project_without_template():
    response = client.post(
        "/project/create",
        headers={"Authorization": f"Bearer {get_access_token()}"},
        json={"title": "test", "description": "test"},
    )

    assert response.status_code == 200

    project = Project.model_validate(response.json(), strict=True)

    assert (
        len(project.users) == 1
    ), "new project should be associated to only one user (the creator of this project)"

    assert (
        project.users[0].username == TEST_USER["username"]
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
        headers={"Authorization": f"Bearer {get_access_token()}"},
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
        project.users[0].username == TEST_USER["username"]
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
