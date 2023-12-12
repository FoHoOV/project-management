from dataclasses import dataclass
from pydantic import BaseModel, constr, field_validator


class ProjectBase(BaseModel):
    pass


@dataclass
class ProjectRead:
    project_id: int


class ProjectCreate(ProjectBase):
    title: constr(max_length=100)  # type: ignore
    description: constr(max_length=100)  # type: ignore

    @field_validator("title")
    @classmethod
    def title_should_not_contain_dash(cls, title: str) -> str:
        if title.find("-") != -1:
            raise ValueError("'-' is not allowed in the project title")
        return title.title()


class ProjectUpdate(ProjectCreate):
    project_id: int


class ProjectDetachAssociation(ProjectBase):
    project_id: int


class ProjectAttachAssociation(ProjectBase):
    project_id: int
    username: constr(min_length=3)  # type: ignore


class ProjectAttachAssociationResponse(ProjectBase):
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


class ProjectPartialTag(BaseModel):
    id: int
    name: str


class Project(ProjectBase):
    id: int
    title: str
    description: str
    users: list[PartialUser]
    todo_categories: list[PartialTodoCategory]
    tags: list[ProjectPartialTag]
    done_todos_count: int
    pending_todos_count: int
