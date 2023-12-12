from fastapi import APIRouter
from pydantic import BaseModel

from error.exceptions import ErrorCode


router = APIRouter(prefix="/error", tags=["error"])


class UserFriendlyErrorSchema(BaseModel):
    code: ErrorCode
    description: str


# a hack just to include these types in the generated OpenApi json
@router.get(
    path="/error-types",
    response_model=UserFriendlyErrorSchema,
)
def include_error_types():
    raise
