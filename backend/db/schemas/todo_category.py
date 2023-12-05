from dataclasses import dataclass
from pydantic import BaseModel, Field
from db.schemas.base import NullableOrderedItem
from db.schemas.todo_item import TodoItem


class TodoCategoryBase(BaseModel):
    title: str
    description: str


class TodoCategoryCreate(TodoCategoryBase):
    project_id: int = Field(exclude=True)


class TodoCategoryUpdateItem(TodoCategoryBase):
    id: int
    title: str | None = None
    description: str | None = None


class TodoCategoryUpdateOrder(BaseModel):
    id: int
    next_id: int
    project_id: int
    moving_id: int


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
    orders: list[NullableOrderedItem]
    items: list[TodoItem]
    projects: list[PartialProject]

    class Config:
        from_attributes = True
