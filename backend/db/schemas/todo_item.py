from dataclasses import dataclass
from enum import Enum
from fastapi import Query
from pydantic import BaseModel, model_validator

from db.schemas.base import NullableOrderedItem


class SearchTodoStatus(Enum):
    ALL = "all"
    DONE = "done"
    PENDING = "pending"


class TodoItemBase(BaseModel):
    title: str
    description: str
    is_done: bool
    category_id: int


class TodoItemCreate(TodoItemBase):
    pass


class TodoItemUpdateItem(TodoItemBase):
    id: int
    new_category_id: int | None = None
    title: str | None = None
    description: str | None = None
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
            raise ValueError("todo id and dependant todo id cannot be the same")
        return self


class TodoItemRemoveDependency(BaseModel):
    dependency_id: int


class TodoItemPartialDependency(BaseModel):
    id: int
    dependant_todo_id: int


class TodoItemPartialTag(BaseModel):
    id: int
    name: str
    project_id: int


class TodoItem(TodoItemBase):
    id: int
    tags: list[TodoItemPartialTag]
    dependencies: list[TodoItemPartialDependency]
    order: NullableOrderedItem | None
    comments_count: int

    class Config:
        from_attributes = True
