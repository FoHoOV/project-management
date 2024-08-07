import datetime
from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field, model_validator

from db.models.todo_category_action import Action
from db.schemas.base import NullableOrderedItem
from db.schemas.todo_item import TodoItem, TodoItemPartialDependency, TodoItemPartialTag
from error.exceptions import ErrorCode, UserFriendlyError


class TodoCategoryBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=100)


class TodoCategoryCreate(TodoCategoryBase):
    project_id: int = Field(exclude=True)


class TodoCategoryUpdateItem(BaseModel):
    title: str | None = Field(min_length=1, max_length=100, default=None)
    description: str | None = Field(min_length=1, max_length=100, default=None)
    actions: list[Action] | None = Field(exclude=True, default=None)


class TodoCategoryUpdateOrder(BaseModel):
    left_id: int | None
    right_id: int | None
    project_id: int


class TodoCategoryUpdate(BaseModel):
    item: TodoCategoryUpdateItem | None = Field(default=None)
    order: TodoCategoryUpdateOrder | None = Field(default=None)

    @model_validator(mode="after")
    def check_at_least_one_is_provided(self):
        if self.order is None and self.item is None:
            raise UserFriendlyError(
                ErrorCode.INVALID_INPUT,
                "order and item cannot be empty at the same time",
            )
        return self


class TodoCategoryAttachAssociation(BaseModel):
    project_id: int


class TodoCategoryDelete(BaseModel):
    id: int


class TodoCategoryPartialProject(BaseModel):
    id: int
    title: str
    description: str


class TodoCategoryPartialAction(BaseModel):
    action: Action


class TodoCategoryPartialUser(BaseModel):
    id: int
    username: str


class TodoCategoryPartialTodoItem(BaseModel):
    id: int
    title: str
    description: str
    is_done: bool
    category_id: int
    due_date: datetime.datetime | None = Field(default=None)
    tags: list[TodoItemPartialTag]
    dependencies: list[TodoItemPartialDependency]
    order: NullableOrderedItem
    comments_count: int
    marked_as_done_by: TodoCategoryPartialUser | None

    model_config = ConfigDict(from_attributes=True)


class TodoCategory(TodoCategoryBase):
    id: int
    orders: list[NullableOrderedItem]
    items: list[TodoCategoryPartialTodoItem]
    projects: list[TodoCategoryPartialProject]
    actions: list[TodoCategoryPartialAction]

    model_config = ConfigDict(from_attributes=True)
