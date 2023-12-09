from dataclasses import dataclass
from pydantic import BaseModel


class TodoCommentBase(BaseModel):
    id: int
    message: str


@dataclass
class TodoCommentSearch:
    todo_id: int


class TodoCommentCreate(BaseModel):
    message: str
    todo_id: int

    class Config:
        from_attributes = True


class TodoCommentUpdate(TodoCommentBase):
    todo_id: int

    class Config:
        from_attributes = True


class TodoCommentDelete(BaseModel):
    id: int


class TodoComment(TodoCommentBase):
    todo_id: int

    class Config:
        from_attributes = True
