from dataclasses import dataclass
from tkinter import NO
from typing import Callable, Type, TypedDict
from sqlalchemy.orm import DeclarativeBase, Query, Session, MappedColumn

from db.utils.exceptions import UserFriendlyError


class OrderedItem(DeclarativeBase):
    left_id: MappedColumn[int | None]
    right_id: MappedColumn[int | None]


class NewOrder(TypedDict):
    item_id: int
    right_id: int | None
    left_id: int | None


def update_element_order[
    TOrderedItemClass: OrderedItem
](
    db: Session,
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    moving_item: NewOrder,
    create_order: Callable[[int, int | None, int | None], None],
    get_item_order: Callable[[int], TOrderedItemClass | None],
    get_item_id: Callable[[TOrderedItemClass], int],
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
        db, order_class, order_query, moving_item["item_id"], get_item_order
    )

    if moving_item["left_id"] is not None:
        existing_item_pointing_to_new_left = order_query.filter(
            order_class.left_id == moving_item["left_id"]
        ).first()

        if (
            existing_item_pointing_to_new_left is not None
            and get_item_id(existing_item_pointing_to_new_left)
            != moving_item["item_id"]
        ):
            existing_item_pointing_to_new_left.left_id = moving_item["item_id"]
            db.commit()

    if moving_item["right_id"] is not None:
        existing_item_pointing_to_new_right = order_query.filter(
            order_class.right_id == moving_item["right_id"]
        ).first()

        if (
            existing_item_pointing_to_new_right is not None
            and get_item_id(existing_item_pointing_to_new_right)
            != moving_item["item_id"]
        ):
            existing_item_pointing_to_new_right.right_id = moving_item["item_id"]
            db.commit()

    db_moving_element_order = get_item_order(moving_item["item_id"])

    if db_moving_element_order:
        db_moving_element_order.left_id = moving_item["left_id"]
        db_moving_element_order.right_id = moving_item["right_id"]
    else:
        create_order(
            moving_item["item_id"], moving_item["left_id"], moving_item["right_id"]
        )

    db.commit()


def delete_item_from_sorted_items[
    TOrderedItemClass: OrderedItem
](
    db: Session,
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    deleting_item_id: int,
    get_item_order: Callable[[int], TOrderedItemClass | None],
):
    _remove_item_from_sorted_items_in_position(
        db, order_class, order_query, deleting_item_id, get_item_order
    )

    # the validation that deleting_item_id exists and belongs to user is callers responsibility
    deleting_item_order = get_item_order(deleting_item_id)

    if deleting_item_order is not None:
        db.delete(deleting_item_order)
        db.commit()


def _remove_item_from_sorted_items_in_position[
    TOrderedItemClass: OrderedItem
](
    db: Session,
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    removing_item_id: int,
    get_item_order: Callable[[int], TOrderedItemClass | None],
):
    # the validation that removing_item_id exists and belongs to user is callers responsibility
    removing_item_order = get_item_order(removing_item_id)
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
        existing_item_pointing_to_left_id = get_item_order(removing_item_order_left_id)
        if existing_item_pointing_to_left_id is not None:
            existing_item_pointing_to_left_id.right_id = removing_item_order_right_id
            db.commit()

    if removing_item_order_right_id is not None:
        existing_item_pointing_to_right_id = get_item_order(
            removing_item_order_right_id
        )
        if existing_item_pointing_to_right_id is not None:
            existing_item_pointing_to_right_id.left_id = removing_item_order_left_id
            db.commit()
