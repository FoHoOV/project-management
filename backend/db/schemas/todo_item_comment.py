from dataclasses import dataclass
from pydantic import BaseModel, ConfigDict, Field


class TodoCommentMessage(BaseModel):
    message: str = Field(min_length=1, max_length=50000)


class TodoCommentCreate(TodoCommentMessage):
    pass


class TodoCommentUpdate(TodoCommentMessage):
    pass


class TodoComment(BaseModel):
    id: int
    todo_id: int
    message: str

    model_config = ConfigDict(from_attributes=True)
