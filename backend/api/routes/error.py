from fastapi import APIRouter
from pydantic import BaseModel


from error.exceptions import ErrorCode, UserFriendlyError


router = APIRouter(prefix="/error", tags=["error"])


class ErrorCodesSchema(BaseModel):
    codes: list[ErrorCode]


# a hack just to include these types in the generated OpenApi json
@router.get(
    path="/error-types",
    response_model=ErrorCodesSchema,
    responses={400: {"error": UserFriendlyError}},
)
def include_error_types():
    raise
