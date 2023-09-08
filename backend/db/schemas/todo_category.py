from ast import List
from pydantic import BaseModel

from db.schemas.todo_item import TodoItem


class TodoCategoryBase(BaseModel):
    title: str
    description: str

class TodoCategoryCreate(TodoCategoryBase):
    pass


class TodoCategory(TodoCategoryBase):
    id: int
    todos: list[TodoItem]

    class Config:
        from_attributes = True