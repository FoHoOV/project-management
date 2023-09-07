from dataclasses import dataclass
from enum import Enum
from typing import Literal
from fastapi import Query
from pydantic import BaseModel


class SearchTodoStatus(Enum):
    ALL = "all"
    DONE = "done"
    PENDING = "pending"


class TodoBase(BaseModel):
    title: str
    description: str
    is_done: bool


class TodoCreate(TodoBase):
    pass


@dataclass
class SearchTodoParams:
    status: SearchTodoStatus = Query(default=SearchTodoStatus.ALL)


class Todo(TodoBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
