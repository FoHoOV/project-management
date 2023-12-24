from datetime import timedelta
import datetime
from click import DateTime
from jose import jwt
from sqlalchemy.orm import Session
from config import settings

from db.utils.user_crud import get_user_by_username, verify_password


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username.strip().lower())
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.UTC) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
