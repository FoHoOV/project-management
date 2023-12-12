from dataclasses import dataclass
from pydantic import BaseModel


@dataclass
class TagSearch:
    name: str


class TagCreate(BaseModel):
    name: str
    project_id: int

    class Config:
        from_attributes = True


class TagAttachToTodo(BaseModel):
    name: str
    todo_id: int


class TagDetachFromTodo(BaseModel):
    tag_id: int
    todo_id: int


class TagUpdate(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class TagDelete(BaseModel):
    id: int


class PartialTodo(BaseModel):
    id: int
    category_id: int
    title: str
    is_done: bool
    description: str


class Tag(BaseModel):
    id: int
    name: str
    project_id: int
    todos: list[PartialTodo]

    class Config:
        from_attributes = True
