from dataclasses import dataclass
from enum import Enum
from typing import Literal
from fastapi import Query
from pydantic import BaseModel


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


@dataclass
class SearchTodoItemParams:
    status: SearchTodoStatus = Query(default=SearchTodoStatus.ALL)


class TodoItem(TodoItemBase):
    id: int
    
    class Config:
        from_attributes = True
