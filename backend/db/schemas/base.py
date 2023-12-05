from pydantic import BaseModel


class NullableOrderedItem(BaseModel):
    next_id: int | None
    moving_id: int
