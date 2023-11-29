from pydantic import BaseModel


class OrderedItem(BaseModel):
    right_id: int | None = None
    left_id: int | None = None
