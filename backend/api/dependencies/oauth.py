from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from joserfc import errors, jwt
from sqlalchemy.orm import Session

from api.dependencies.db import get_db
from config import settings
from db.schemas.oath_token import TokenData
from db.utils.oatuh import get_signing_key
from db.utils.user_crud import get_user_by_username

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/oauth/token")
claims_registry = jwt.JWTClaimsRegistry(
    exp={"essential": True}, sub={"essential": True}
)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, get_signing_key(), [settings.ALGORITHM])
        claims_registry.validate(payload.claims)

        username: str = payload.claims["sub"]
        token_data = TokenData(username=username)
    except errors.JoseError:
        raise credentials_exception

    user = get_user_by_username(db, username=token_data.username)

    if user is None:
        raise credentials_exception

    return user
