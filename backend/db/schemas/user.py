from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

# bcrypt>=5 rejects longer passwords instead of silently truncating them
PASSWORD_MAX_BYTES = 72


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=30)

    @model_validator(mode="after")
    def strip_and_lower_username(self):
        self.username = self.username.strip().lower()
        return self


class UserCreate(UserBase):
    password: str = Field(min_length=5, max_length=PASSWORD_MAX_BYTES)
    confirm_password: str = Field(
        min_length=5, max_length=PASSWORD_MAX_BYTES, exclude=True
    )

    @field_validator("password")
    @classmethod
    def check_password_byte_length(cls, password: str):
        if len(password.encode("utf-8")) > PASSWORD_MAX_BYTES:
            raise ValueError(f"password must be at most {PASSWORD_MAX_BYTES} bytes")
        return password

    @model_validator(mode="after")
    def check_passwords_match(self):
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
