from pydantic import BaseModel, Field, constr, model_validator
from .todo import Todo


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: constr(min_length=5, max_length=20)
    confirm_password: constr(min_length=5, max_length=20) = Field(exclude=True)

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserCreate":
        pw1 = self.password
        pw2 = self.confirm_password
        if pw1 is not None and pw2 is not None and pw1 != pw2:
            raise ValueError("passwords do not match")
        return self


class UserAuthenticate(UserBase):
    password: str


class User(UserBase):
    id: int
    todos: list[Todo] = []

    class Config:
        from_attributes = True
