from dataclasses import dataclass
from pydantic import BaseModel, Field
from db.schemas.project import Project

from db.schemas.todo_item import TodoItem


class TodoCategoryBase(BaseModel):
    title: str
    description: str


class TodoCategoryCreate(TodoCategoryBase):
    project_id: int = Field(exclude=True)


class TodoCategoryUpdate(TodoCategoryBase):
    id: int


@dataclass
class TodoCategoryRead:
    id: int


class TodoCategoryDelete(BaseModel):
    id: int


class TodoCategory(TodoCategoryBase):
    id: int
    items: list[TodoItem]
    projects: list[Project]

    class Config:
        from_attributes = True
