from pydantic import BaseModel, ConfigDict, Field, model_validator


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=30)

    @model_validator(mode="after")
    def strip_and_lower_username(self) -> "UserBase":
        self.username = self.username.strip().lower()
        return self


class UserCreate(UserBase):
    password: str = Field(min_length=5, max_length=100)
    confirm_password: str = Field(min_length=5, max_length=100, exclude=True)

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserCreate":
        pw1 = self.password
        pw2 = self.confirm_password
        if pw1 is not None and pw2 is not None and pw1 != pw2:
            raise ValueError("passwords do not match")
        return self


class PartialProject(BaseModel):
    id: int
    title: str
    description: str


class User(UserBase):
    id: int
    projects: list[PartialProject] = []

    model_config = ConfigDict(from_attributes=True)
