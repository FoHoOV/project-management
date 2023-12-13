from pydantic import BaseModel, Field, constr, model_validator


class UserBase(BaseModel):
    username: str = Field(min_length=1, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=1, max_length=500)
    confirm_password: str = Field(min_length=1, max_length=500, exclude=True)

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserCreate":
        pw1 = self.password
        pw2 = self.confirm_password
        if pw1 is not None and pw2 is not None and pw1 != pw2:
            raise ValueError("passwords do not match")
        return self


class UserAuthenticate(UserBase):
    password: str = Field(min_length=1, max_length=500)


class PartialProject(BaseModel):
    id: int
    title: str
    description: str


class User(UserBase):
    id: int
    projects: list[PartialProject] = []

    class Config:
        from_attributes = True
