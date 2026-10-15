from bcrypt import checkpw, gensalt, hashpw
from sqlalchemy.orm import Session

from db.models.user import User
from db.schemas.user import UserCreate


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username.strip().lower()).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


_BCRYPT_MAX_PASSWORD_BYTES = 72


def _encode_password(password: str) -> bytes:
    # bcrypt only uses the first 72 bytes. bcrypt<5 truncated silently and
    # bcrypt>=5 raises instead, so truncate here to keep existing hashes valid.
    return password.encode("utf-8")[:_BCRYPT_MAX_PASSWORD_BYTES]


def verify_password(plain_password: str, hashed_password: str):
    return checkpw(_encode_password(plain_password), hashed_password.encode("utf-8"))


def get_password_hash(password: str):
    return hashpw(_encode_password(password), gensalt()).decode("utf-8")


def create_user(db: Session, user: UserCreate):
    user.password = get_password_hash(user.password)
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    return db_user
