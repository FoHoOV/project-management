from dataclasses import dataclass
import json
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    computed_field,
)

from db.models.base import Base
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
    user_id: int | None = Field(default=None)


class _Permissions(BaseModel):
    permissions: list[Permission] = Field(min_length=1)

    @field_validator("permissions")
    @classmethod
    def permissions_length(cls, permissions: list[Permission]) -> list[Permission]:
        if len(permissions) == 0:
            raise ValueError(
                f"you need to explicitly set what permissions is this user going to have"
            )

        if len(set(permissions)) != len(permissions):
            raise ValueError("repetitive values in permissions list is not allowed")

        return list(set(permissions))

    @field_validator("permissions", mode="after")
    @classmethod
    def has_other_permissions_with_owner_permission(
        cls, permissions: list[Permission]
    ) -> list[Permission]:
        if (
            len(list(filter(lambda perm: perm == Permission.ALL, permissions))) == 1
            and len(permissions) > 1
        ):
            raise ValueError(
                "if a user has the `ALL` permission then setting other permissions to them is not allowed"
            )
        return permissions


class ProjectAttachAssociation(ProjectBase, _Permissions):
    project_id: int
    username: str = Field(min_length=3, max_length=100)


class ProjectAttachAssociationResponse(ProjectBase):
    project_id: int
    user_id: int


class ProjectUpdateUserPermissions(ProjectBase, _Permissions):
    project_id: int
    user_id: int


class _UserProjectPermission(BaseModel):
    permission: Permission

    model_config = ConfigDict(from_attributes=True)


class _ProjectUserAssociation(BaseModel):
    user_id: int
    project_id: int
    permissions: list[_UserProjectPermission]

    model_config = ConfigDict(from_attributes=True)


class _PartialUser(BaseModel):
    id: int
    username: str
    associations: list[_ProjectUserAssociation]

    model_config = ConfigDict(from_attributes=True)


class PartialUserWithPermission(_Permissions):
    id: int
    username: str


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

    users_: list[_PartialUser] = Field(exclude=True, default=[], alias="users")

    @computed_field
    @property
    def users(self) -> list[PartialUserWithPermission]:
        # TODO: think of another way, this way sux ass also is shitty performance wise,
        # new solution should follow these:
        # 1- for each project's user's permissions we should NOT perform a new query to the database (if user has 10000 associations then 9999 of them could be redundant :}) because accessing project.users[x].association is a new query then association.permissions is also another query
        # 2- it should be universal, whenever I return a project schema, the permissions should be there per user (even in create we return the project which should contain the user who created it with the associated permission)
        # (preferred) 3- removes the associations as a relationship property on User and Project models
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

    @field_validator("users_", mode="before")
    @classmethod
    def ignore_if_users_provided(cls, value, validation_data):
        if (
            isinstance(value, list)
            and len(value) > 0
            and not isinstance(value[0], Base)
        ):
            return [
                {
                    "id": user["id"],
                    "username": user["username"],
                    "associations": [
                        {
                            "user_id": user["id"],
                            "project_id": validation_data.data["id"],
                            "permissions": [
                                {"permission": Permission(perm)}
                                for perm in user["permissions"]
                            ],
                        }
                    ],
                }
                for user in value
            ]
        return value

    model_config = ConfigDict(from_attributes=True)
