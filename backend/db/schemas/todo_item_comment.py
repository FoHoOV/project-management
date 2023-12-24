from dataclasses import dataclass
from pydantic import BaseModel, ConfigDict, Field


class TodoCommentBase(BaseModel):
    id: int
    message: str = Field(min_length=1, max_length=50000)


@dataclass
class TodoCommentSearch:
    todo_id: int


class TodoCommentCreate(BaseModel):
    message: str = Field(min_length=1, max_length=50000)
    todo_id: int

    model_config = ConfigDict(from_attributes=True)


class TodoCommentUpdate(TodoCommentBase):
    todo_id: int

    model_config = ConfigDict(from_attributes=True)


class TodoCommentDelete(BaseModel):
    id: int


class TodoComment(TodoCommentBase):
    todo_id: int

    model_config = ConfigDict(from_attributes=True)
