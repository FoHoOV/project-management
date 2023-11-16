from typing import Optional
from pydantic import BaseModel, Field, constr
from db.schemas.todo_category import TodoCategory

from db.schemas.user import User


class ProjectBase(BaseModel):
    pass


class ProjectRead(BaseModel):
    project_id: int


class ProjectUserAssociationValidation(BaseModel):
    project_id: int
    user_id: int


class ProjectCreate(ProjectBase):
    title: constr(min_length=5, max_length=20)  # type: ignore
    description: constr(min_length=5, max_length=20)  # type: ignore


class ProjectAddUser(ProjectBase):
    project_id: int
    user_id: int


class Project(ProjectBase):
    users: list[User]
    todo_categories: list[TodoCategory]
