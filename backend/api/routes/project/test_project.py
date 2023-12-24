from fastapi.testclient import TestClient
from api.test import get_access_token, app


client = TestClient(app, base_url="http://testserver/project")


def test_create_project():
    response = client.post(
        "/project/create",
        headers={"Authorization": f"Bearer {get_access_token()}"},
        json={"title": "test", "description": "test"},
    )
    assert response.status_code == 200
    assert response.json() == {"msg": "Hello World"}
