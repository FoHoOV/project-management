from pydantic import BaseModel


class NullableOrderedItem(BaseModel):
    right_id: int | None
    left_id: int | None
