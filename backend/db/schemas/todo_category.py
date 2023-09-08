from pydantic import BaseModel

from db.schemas.todo_item import TodoItem


class TodoCategoryBase(BaseModel):
    title: str
    description: str


class TodoCategoryCreate(TodoCategoryBase):
    pass

class TodoCategoryUpdate(TodoCategoryBase):
    id: int

class TodoCategoryDelete(BaseModel):
    id: int


class TodoCategory(TodoCategoryBase):
    id: int
    items: list[TodoItem]

    class Config:
        from_attributes = True
