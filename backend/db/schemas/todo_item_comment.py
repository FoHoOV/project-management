from dataclasses import dataclass
from pydantic import BaseModel


class TodoCommentBase(BaseModel):
    message: str
    id: int


@dataclass
class TodoCommentSearch:
    todo_id: int


class TodoCommentCreate(BaseModel):
    message: str
    todo_id: int


class TodoCommentUpdate(TodoCommentBase):
    todo_id: int


class TodoCommentDelete(BaseModel):
    id: int


class TodoComment(TodoCommentBase):
    todo_id: int
