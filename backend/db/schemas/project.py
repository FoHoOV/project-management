from dataclasses import dataclass
from pydantic import BaseModel, constr


class ProjectBase(BaseModel):
    pass


@dataclass
class ProjectRead:
    project_id: int


class ProjectCreate(ProjectBase):
    title: constr(max_length=100)  # type: ignore
    description: constr(max_length=100)  # type: ignore


class ProjectDetachAssociation(ProjectBase):
    project_id: int


class ProjectAttachAssociation(ProjectBase):
    project_id: int
    username: constr(min_length=3)  # type: ignore


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
