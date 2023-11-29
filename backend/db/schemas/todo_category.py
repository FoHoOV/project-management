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
    order: int | None = None
    title: str | None = None
    description: str | None = None


class TodoCategoryAttachAssociation(BaseModel):
    project_id: int
    category_id: int


class TodoCategoryDetachAssociation(BaseModel):
    category_id: int
    project_id: int


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
    order: int
    items: list[TodoItem]
    projects: list[PartialProject]

    class Config:
        from_attributes = True
