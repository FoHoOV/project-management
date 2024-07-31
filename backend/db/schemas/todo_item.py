import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, model_validator

from db.schemas.base import NullableOrderedItem
from error.exceptions import ErrorCode, UserFriendlyError


class SearchTodoStatus(Enum):
    ALL = "all"
    DONE = "done"
    PENDING = "pending"


class TodoItemBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=100)
    is_done: bool
    category_id: int
    due_date: datetime.datetime | None = Field(default=None)


class TodoItemCreate(TodoItemBase):
    pass


class TodoItemUpdateItem(BaseModel):
    new_category_id: int | None = None
    title: str | None = Field(min_length=1, max_length=100, default=None)
    description: str | None = Field(min_length=1, max_length=100, default=None)
    due_date: datetime.datetime | None = Field(default=None)
    is_done: bool | None = None


class TodoItemUpdateOrder(BaseModel):
    left_id: int | None
    right_id: int | None
    new_category_id: int


class TodoItemUpdate(BaseModel):
    order: TodoItemUpdateOrder | None = Field(default=None)
    item: TodoItemUpdateItem | None = Field(default=None)

    @model_validator(mode="after")
    def check_at_least_one_is_provided(self):
        if self.order is None and self.item is None:
            raise UserFriendlyError(
                ErrorCode.INVALID_INPUT,
                "order and item cannot be empty at the same time",
            )
        return self


class TodoItemAddDependency(BaseModel):
    dependant_todo_id: int

    def ensure_different_todo_ids(self, current_todo_id: int):
        if current_todo_id == self.dependant_todo_id:
            raise UserFriendlyError(
                ErrorCode.INVALID_INPUT,
                "todo id and dependant todo id cannot be the same",
            )


class TodoItemPartialDependency(BaseModel):
    id: int
    dependant_todo_id: int
    dependant_todo_title: str


class TodoItemPartialTag(BaseModel):
    id: int
    name: str
    project_id: int


class TodoItemPartialProject(BaseModel):
    id: int
    title: str


class TodoItemPartialCategory(BaseModel):
    id: int
    title: str
    description: str
    projects: list[TodoItemPartialProject]


class TodoItemPartialUser(BaseModel):
    id: int
    username: str


class TodoItem(TodoItemBase):
    id: int
    category: TodoItemPartialCategory
    tags: list[TodoItemPartialTag]
    dependencies: list[TodoItemPartialDependency]
    order: NullableOrderedItem
    comments_count: int
    marked_as_done_by: TodoItemPartialUser | None

    model_config = ConfigDict(from_attributes=True)
