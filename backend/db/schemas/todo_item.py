from dataclasses import dataclass
from enum import Enum
from fastapi import Query
from pydantic import BaseModel

from db.schemas.base import NullableOrderedItem, OrderedItem


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
    title: str | None
    description: str | None
    is_done: bool | None = None


class TodoItemUpdateOrder(BaseModel):
    id: int
    order: OrderedItem
    moving_id: int


class TodoItemDelete(BaseModel):
    id: int


@dataclass
class SearchTodoItemParams:
    project_id: int
    category_id: int
    status: SearchTodoStatus = Query(default=SearchTodoStatus.ALL)


class TodoItem(TodoItemBase):
    id: int
    order: NullableOrderedItem | None

    class Config:
        from_attributes = True
