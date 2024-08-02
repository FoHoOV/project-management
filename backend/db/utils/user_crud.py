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


def verify_password(plain_password: str, hashed_password: str):
    return checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def get_password_hash(password: str):
    return hashpw(password.encode("utf-8"), gensalt()).decode("utf-8")


def create_user(db: Session, user: UserCreate):
    user.password = get_password_hash(user.password)
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    return db_user
