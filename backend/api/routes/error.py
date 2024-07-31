from fastapi import APIRouter
from pydantic import BaseModel

from error.exceptions import ErrorCode


router = APIRouter(prefix="/types", tags=["types"])
description = "just to include types in openapi.json"


class UserFriendlyErrorSchema(BaseModel):
    code: ErrorCode
    message: str


# a hack just to include these types in the generated OpenApi json
@router.get(
    path="/errors", response_model=UserFriendlyErrorSchema, description=description
)
def include_error_types():
    raise
