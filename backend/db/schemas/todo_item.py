from dataclasses import dataclass
from datetime import date
import datetime
from enum import Enum
from fastapi import Query
from pydantic import BaseModel, Field, model_validator

from db.schemas.base import NullableOrderedItem
from error.exceptions import ErrorCode, UserFriendlyError


class SearchTodoStatus(Enum):
    ALL = "all"
    DONE = "done"
    PENDING = "pending"


class TodoItemBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=100)
    is_done: bool
    category_id: int
    due_date: datetime.datetime | None = Field(default=None)


class TodoItemCreate(TodoItemBase):
    pass


class TodoItemUpdateItem(TodoItemBase):
    id: int
    new_category_id: int | None = None
    title: str | None = Field(min_length=1, max_length=100, default=None)
    description: str | None = Field(min_length=1, max_length=100, default=None)
    is_done: bool | None = None


class TodoItemUpdateOrder(BaseModel):
    id: int
    left_id: int | None
    right_id: int | None
    new_category_id: int


class TodoItemDelete(BaseModel):
    id: int


@dataclass
class SearchTodoItemParams:
    project_id: int
    category_id: int
    status: SearchTodoStatus = Query(default=SearchTodoStatus.ALL)


class TodoItemAddDependency(BaseModel):
    todo_id: int
    dependant_todo_id: int

    @model_validator(mode="after")
    def check_todo_ids(self) -> "TodoItemAddDependency":
        if self.todo_id == self.dependant_todo_id:
            raise UserFriendlyError(
                ErrorCode.INVALID_INPUT,
                "todo id and dependant todo id cannot be the same",
            )
        return self


class TodoItemRemoveDependency(BaseModel):
    dependency_id: int


class TodoItemPartialDependency(BaseModel):
    id: int
    dependant_todo_id: int
    dependant_todo_title: str


class TodoItemPartialTag(BaseModel):
    id: int
    name: str
    project_id: int


class TodoItemPartialProject(BaseModel):
    id: int
    title: str


class TodoItemPartialCategory(BaseModel):
    id: int
    title: str
    description: str
    projects: list[TodoItemPartialProject]


class TodoItemPartialUser(BaseModel):
    id: int
    username: str


class TodoItem(TodoItemBase):
    id: int
    category: TodoItemPartialCategory | None
    tags: list[TodoItemPartialTag]
    dependencies: list[TodoItemPartialDependency]
    order: NullableOrderedItem | None
    comments_count: int
    marked_as_done_by: TodoItemPartialUser | None

    class Config:
        from_attributes = True
