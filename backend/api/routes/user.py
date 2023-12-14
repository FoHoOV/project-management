from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.dependencies.db import get_db
from api.dependencies.oauth import get_current_user
from db.schemas.user import User, UserCreate, UserAuthenticate
from db.utils import user_crud


router = APIRouter(prefix="/user", tags=["user"])


@router.post("/signup", response_model=User)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_username(db, username=user.username)
    if db_user is not None:
        raise HTTPException(
            status_code=400, detail={"username": "Username already registered"}
        )
    return user_crud.create_user(db=db, user=user)


@router.get("/info", response_model=User)
def info(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return current_user
