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


class ProjectAssociationDelete(ProjectBase):
    project_id: int


class ProjectAddUser(ProjectBase):
    project_id: int
    user_id: int


class PartialUser(BaseModel):
    id: int
    username: str


class PartialTodoCategory(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class Project(ProjectBase):
    id: int
    title: str
    description: str
    users: list[PartialUser]
    todo_categories: list[PartialTodoCategory]
