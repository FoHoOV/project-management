from dataclasses import dataclass
from pydantic import BaseModel, Field, model_validator
from db.models.todo_category_action import Action
from db.schemas.base import NullableOrderedItem
from db.schemas.todo_item import TodoItem


class TodoCategoryBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=100)


class TodoCategoryCreate(TodoCategoryBase):
    project_id: int = Field(exclude=True)


class TodoCategoryUpdateItem(TodoCategoryBase):
    id: int
    title: str | None = Field(min_length=1, max_length=100, default=None)
    description: str | None = Field(min_length=1, max_length=100, default=None)
    actions: list[Action] | None = Field(exclude=True, default=None)


class TodoCategoryUpdateOrder(BaseModel):
    id: int
    left_id: int | None
    right_id: int | None
    project_id: int


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


class PartialAction(BaseModel):
    action: Action


class TodoCategory(TodoCategoryBase):
    id: int
    orders: list[NullableOrderedItem]
    items: list[TodoItem]
    projects: list[PartialProject]
    actions: list[PartialAction]

    class Config:
        from_attributes = True
