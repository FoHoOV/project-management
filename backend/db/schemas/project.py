from dataclasses import dataclass
import json
from pydantic import BaseModel, ConfigDict, Field, field_validator, computed_field

from db.models.user_project_permission import Permission


class ProjectBase(BaseModel):
    pass


@dataclass
class ProjectRead:
    project_id: int


class ProjectCreate(ProjectBase):
    title: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=1, max_length=100)
    create_from_default_template: bool = Field(exclude=True, default=False)

    @field_validator("title")
    @classmethod
    def title_invalid_chars(cls, title: str) -> str:
        invalid_character_set = ["-", "+", "?", "/"]
        if any(ch in invalid_character_set for ch in title):
            raise ValueError(
                f"{json.dumps(invalid_character_set)} is not allowed in the project title"
            )
        return title


class ProjectUpdate(ProjectCreate):
    project_id: int


class ProjectDetachAssociation(ProjectBase):
    project_id: int


class ProjectAttachAssociation(ProjectBase):
    project_id: int
    username: str = Field(min_length=3, max_length=100)
    permissions: list[Permission]

    @field_validator("permissions")
    @classmethod
    def permissions_length(cls, permissions: list[Permission]) -> list[Permission]:
        if len(permissions) == 0:
            raise ValueError(
                f"you need to explicitly set what permissions is this user going to have"
            )

        if len(set(permissions)) != len(permissions):
            raise ValueError("repetitive values in permissions list is not allowed")

        return permissions


class ProjectAttachAssociationResponse(ProjectBase):
    project_id: int
    user_id: int


class UserProjectPermission(BaseModel):
    permission: Permission

    model_config = ConfigDict(from_attributes=True)


class ProjectUserAssociation(BaseModel):
    user_id: int
    project_id: int
    permissions: list[UserProjectPermission]

    model_config = ConfigDict(from_attributes=True)


class PartialUser(BaseModel):
    id: int
    username: str
    associations: list[ProjectUserAssociation]

    model_config = ConfigDict(from_attributes=True)


class PartialUserWithPermission(BaseModel):
    id: int
    username: str
    permissions: list[Permission]


class PartialTodoCategory(BaseModel):
    id: int
    title: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class ProjectPartialTag(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class Project(ProjectBase):
    id: int
    title: str
    description: str
    todo_categories: list[PartialTodoCategory]
    tags: list[ProjectPartialTag]
    done_todos_count: int
    pending_todos_count: int

    users_: list[PartialUser] = Field(exclude=True, alias="users")

    @computed_field
    @property
    def users(self) -> list[PartialUserWithPermission]:
        return [
            PartialUserWithPermission(
                **user.model_dump(),
                permissions=[
                    perm.permission
                    for association in filter(
                        lambda association: association.project_id == self.id,
                        user.associations,
                    )
                    for perm in association.permissions
                ],
            )
            for user in self.users_
        ]

    model_config = ConfigDict(from_attributes=True)
