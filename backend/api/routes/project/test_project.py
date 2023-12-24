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

    assert len(project.users) == 1
    assert project.users[0].username == TEST_USER["username"]
    assert len(project.todo_categories) == 0
    assert project.done_todos_count == 0
    assert project.pending_todos_count == 0


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

    assert len(project.users) == 1
    assert project.users[0].username == TEST_USER["username"]
    assert len(project.todo_categories) == 4
    assert project.done_todos_count == 0
    assert project.pending_todos_count == 0
