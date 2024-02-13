from dataclasses import dataclass
import json
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProjectBase(BaseModel):
    pass


@dataclass
class ProjectRead:
    project_id: int


class ProjectCreate(ProjectBase):
    title: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=1, max_length=100)
    create_from_default_template: bool = Field(exclude=True, default=False)

    @field_validator("title")
    @classmethod
    def title_invalid_chars(cls, title: str) -> str:
        invalid_character_set = ["-", "+", "?", "/"]
        if any(ch in invalid_character_set for ch in title):
            raise ValueError(
                f"{json.dumps(invalid_character_set)} is not allowed in the project title"
            )
        return title


class ProjectUpdate(ProjectCreate):
    project_id: int


class ProjectDetachAssociation(ProjectBase):
    project_id: int


class ProjectAttachAssociation(ProjectBase):
    project_id: int
    username: str = Field(min_length=3, max_length=100)


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

    model_config = ConfigDict(from_attributes=True)


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
