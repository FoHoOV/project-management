from dataclasses import dataclass
from pydantic import BaseModel, constr


class ProjectBase(BaseModel):
    pass


@dataclass
class ProjectRead:
    project_id: int


class ProjectUserAssociationValidation(BaseModel):
    project_id: int
    user_id: int


class ProjectCreate(ProjectBase):
    title: constr(min_length=5, max_length=20)  # type: ignore
    description: constr(min_length=5, max_length=20)  # type: ignore


class ProjectAddUser(ProjectBase):
    project_id: int
    user_id: int


class User(BaseModel):
    id: int
    username: str


class TodoCategory(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class Project(ProjectBase):
    users: list[User]
    todo_categories: list[TodoCategory]
