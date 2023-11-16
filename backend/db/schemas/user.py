from pydantic import BaseModel, Field, constr, model_validator


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: constr(min_length=5, max_length=20)  # type: ignore
    confirm_password: constr(min_length=5, max_length=20) = Field(exclude=True)  # type: ignore

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserCreate":
        pw1 = self.password
        pw2 = self.confirm_password
        if pw1 is not None and pw2 is not None and pw1 != pw2:
            raise ValueError("passwords do not match")
        return self


class UserAuthenticate(UserBase):
    password: str


class PartialProject(BaseModel):
    id: int
    title: str
    description: str


class User(UserBase):
    id: int
    projects: list[PartialProject] = []

    class Config:
        from_attributes = True
