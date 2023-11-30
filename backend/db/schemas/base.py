from pydantic import BaseModel


class OrderedItem(BaseModel):
    next_id: int


class NullableOrderedItem(BaseModel):
    next_id: int | None
