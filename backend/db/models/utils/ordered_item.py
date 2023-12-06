from typing import Type
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Mapped, Query
from db.models.base import BaseOrderedItem
from db.utils.exceptions import UserFriendlyError

from typing import Callable, Type, TypedDict
from sqlalchemy.orm import Query, Session

from db.utils.exceptions import UserFriendlyError


class NewOrder(TypedDict):
    item_id: int
    right_id: int | None
    left_id: int | None


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
        raise UserFriendlyError(
            f"these values create a cyclic/invalid order: {item_id=}, {new_left_id=}, {new_right_id=}"
        )


def update_element_order[
    TOrderedItemClass: BaseOrderedItem
](
    db: Session,
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    item_id_column: Mapped[int],
    moving_item: NewOrder,
    create_order: Callable[[int, int | None, int | None], None],
):
    if (
        moving_item["item_id"] == moving_item["left_id"]
        or moving_item["item_id"] == moving_item["right_id"]
        or (
            moving_item["left_id"] is not None
            and moving_item["left_id"] == moving_item["right_id"]
        )
    ):
        raise UserFriendlyError("inputs values create a cyclic order")

    # the validation that moving_id, id, next_id exists and belongs to user is callers responsibility
    _remove_item_from_sorted_items_in_position(
        db, order_class, order_query, item_id_column, moving_item["item_id"]
    )

    if moving_item["left_id"] is not None:
        order_query.filter(
            order_class.left_id == moving_item["left_id"],
            item_id_column != moving_item["item_id"],
        ).update({"left_id": moving_item["item_id"]})
        db.commit()

        order_query.filter(item_id_column == moving_item["left_id"]).update(
            {"right_id": moving_item["item_id"]}
        )
        db.commit()

    if moving_item["right_id"] is not None:
        order_query.filter(
            order_class.right_id == moving_item["right_id"],
            item_id_column != moving_item["item_id"],
        ).update({"right_id": moving_item["item_id"]})
        db.commit()

        order_query.filter(item_id_column == moving_item["right_id"]).update(
            {"left_id": moving_item["item_id"]}
        )
        db.commit()

    db_moving_element_order = order_query.filter(
        item_id_column == moving_item["item_id"]
    ).first()

    if db_moving_element_order is not None:
        db_moving_element_order.left_id = moving_item["left_id"]
        db_moving_element_order.right_id = moving_item["right_id"]
    else:
        create_order(
            moving_item["item_id"], moving_item["left_id"], moving_item["right_id"]
        )

    db.commit()


def delete_item_from_sorted_items[
    TOrderedItemClass: BaseOrderedItem
](
    db: Session,
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    item_id_column: Mapped[int],
    deleting_item_id: int,
):
    _remove_item_from_sorted_items_in_position(
        db, order_class, order_query, item_id_column, deleting_item_id
    )

    # the validation that deleting_item_id exists and belongs to user is callers responsibility
    order_query.filter(item_id_column == deleting_item_id).delete()
    db.commit()


def _remove_item_from_sorted_items_in_position[
    TOrderedItemClass: BaseOrderedItem
](
    db: Session,
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    item_id_column: Mapped[int],
    removing_item_id: int,
):
    # the validation that removing_item_id exists and belongs to user is callers responsibility
    removing_item_order = order_query.filter(item_id_column == removing_item_id).first()
    removing_item_order_right_id = (
        removing_item_order.right_id if removing_item_order else None
    )
    removing_item_order_left_id = (
        removing_item_order.left_id if removing_item_order else None
    )

    if removing_item_order is not None:
        removing_item_order.left_id = None
        removing_item_order.right_id = None
        db.commit()

    order_query.filter(order_class.right_id == removing_item_id).update(
        {"right_id": removing_item_order_right_id},
    )

    order_query.filter(order_class.left_id == removing_item_id).update(
        {"left_id": removing_item_order_left_id},
    )

    db.commit()

    if removing_item_order is None:
        return

    if removing_item_order_left_id is not None:
        order_query.filter(item_id_column == removing_item_order_left_id).update(
            {"right_id": removing_item_order_right_id}
        )

    if removing_item_order_right_id is not None:
        order_query.filter(item_id_column == removing_item_order_right_id).update(
            {"left_id": removing_item_order_left_id}
        )
