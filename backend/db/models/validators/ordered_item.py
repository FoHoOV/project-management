from typing import Type
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Mapped, Query
from db.models.base import BaseOrderedItem
from error.exceptions import UserFriendlyError

from typing import Callable, Type, TypedDict
from sqlalchemy.orm import Query, Session

from error.exceptions import UserFriendlyError


def cyclic_order_validator[
    TOrderedItemClass: BaseOrderedItem
](
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    item_id_column: Mapped[int],
    item_id: int,
    new_left_id: int | None,
    new_right_id: int | None,
    get_item_id: Callable[[TOrderedItemClass], int],
):
    has_errors = False
    if new_left_id is not None:
        has_errors = order_query.filter(
            or_(
                and_(
                    order_class.right_id == item_id,
                    item_id_column != new_left_id,
                ),
                (and_(item_id_column == new_left_id, order_class.right_id != item_id)),
            )
        ).count()

        # if not has_errors:
        #     result = order_query.filter(order_class.left_id == item_id).first()
        #     if result is not None and get_item_id(result) != new_right_id:
        #         has_errors = True

    if new_right_id is not None and not has_errors:
        has_errors = (
            order_query.filter(
                or_(
                    and_(
                        order_class.left_id == item_id,
                        item_id_column != new_right_id,
                    ),
                    (
                        and_(
                            item_id_column == new_right_id,
                            order_class.left_id != item_id,
                        )
                    ),
                )
            ).count()
            > 0
        )

        # if not has_errors:
        #     result = order_query.filter(order_class.right_id == item_id).first()
        #     if result is not None and get_item_id(result) != new_left_id:
        #         has_errors = True

    if has_errors:
        return
        # raise UserFriendlyError(
        #     f"these values create a cyclic/invalid order: {item_id=}, {new_left_id=}, {new_right_id=}"
        # )
