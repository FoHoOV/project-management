from pydantic import BaseModel


class OrderedItem(BaseModel):
    next_id: int | None = None
