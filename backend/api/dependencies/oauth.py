from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from api.dependencies.db import get_db
from db.schemas.oath_token import TokenData

from sqlalchemy.orm import Session

from config import settings
from db.utils.user_crud import get_user_by_username

from joserfc import jwt, errors


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/oauth/token")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, [settings.ALGORITHM])

        if payload.claims.get("sub", None) is None:
            raise credentials_exception

        username: str = payload.claims.get("sub")  # type: ignore
        token_data = TokenData(username=username)
    except errors.JoseError:
        raise credentials_exception

    user = get_user_by_username(db, username=token_data.username)

    if user is None:
        raise credentials_exception

    return user
