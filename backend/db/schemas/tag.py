from dataclasses import dataclass
from pydantic import BaseModel, ConfigDict, Field


@dataclass
class TagSearch:
    name: str
    project_id: int | None = None

    def __post_init__(self):
        self.name = self.name.strip().lower()


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    project_id: int

    model_config = ConfigDict(
        from_attributes=True, str_to_lower=True, str_strip_whitespace=True
    )


class TagAttachToTodo(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    todo_id: int
    project_id: int
    create_if_doesnt_exist: bool

    model_config = ConfigDict(str_to_lower=True, str_strip_whitespace=True)


class TagDetachFromTodo(BaseModel):
    tag_id: int
    todo_id: int


class TagUpdate(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(
        from_attributes=True, str_to_lower=True, str_strip_whitespace=True
    )


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

    model_config = ConfigDict(from_attributes=True)
