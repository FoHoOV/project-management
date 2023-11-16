from dataclasses import dataclass
from pydantic import BaseModel, Field
from db.schemas.todo_item import TodoItem


class TodoCategoryBase(BaseModel):
    title: str
    description: str


class TodoCategoryCreate(TodoCategoryBase):
    project_id: int = Field(exclude=True)


class TodoCategoryUpdate(TodoCategoryBase):
    id: int


class TodoCategoryAddToProject(BaseModel):
    project_id: int
    category_id: int


@dataclass
class TodoCategoryRead:
    project_id: int


class TodoCategoryDelete(BaseModel):
    id: int


class PartialProject(BaseModel):
    id: int
    title: str
    description: str


class TodoCategory(TodoCategoryBase):
    id: int
    items: list[TodoItem]
    projects: list[PartialProject]

    class Config:
        from_attributes = True
