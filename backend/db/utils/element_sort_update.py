from ast import Call
from dataclasses import dataclass
from tkinter import NO
from typing import Callable, Type, TypedDict
from fastapi.exceptions import ValidationException
from pydantic import ValidationError
from sqlalchemy.orm import DeclarativeBase, Mapped, Query, Session, MappedColumn


class OrderedItem(DeclarativeBase):
    id: MappedColumn[int]
    left_id: MappedColumn[int | None]
    right_id: MappedColumn[int | None]


class NewOrder(TypedDict):
    id: int
    right_id: int | None
    left_id: int | None


def update_element_order[
    TOrderedItemClass: OrderedItem
](
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    moving_item: NewOrder,
    create_order: Callable[[int, int | None, int | None], None],
    get_item_order: Callable[[int], TOrderedItemClass | None],
):
    if (
        moving_item["id"] == moving_item["left_id"]
        or moving_item["id"] == moving_item["right_id"]
        or (
            moving_item["left_id"] is not None
            and moving_item["left_id"] == moving_item["right_id"]
        )
    ):
        raise ValidationException("inputs values create a cyclic order")

    # the validation that moving_id, id, next_id exists and belongs to user is callers responsibility
    _remove_item_from_sorted_items_in_position(
        order_class, order_query, moving_item["id"], get_item_order
    )

    if moving_item["left_id"] is not None:
        if (
            order_query.filter(
                order_class.id == moving_item["left_id"],
                order_class.left_id == moving_item["id"],
            ).count()
            > 0
        ):
            raise ValidationException("inputs values create a cyclic order")

        order_query.filter(
            order_class.left_id == moving_item["left_id"],
            order_class.id != moving_item["id"],
        ).update({"left_id": moving_item["id"]})

    if moving_item["right_id"] is not None:
        if (
            order_query.filter(
                order_class.id == moving_item["right_id"],
                order_class.right_id == moving_item["id"],
            ).count()
            > 0
        ):
            raise ValidationException("inputs values create a cyclic order")

        order_query.filter(
            order_class.right_id == moving_item["right_id"],
            order_class.id != moving_item["id"],
        ).update({"right_id": moving_item["id"]})

    db_moving_element_order = get_item_order(moving_item["id"])

    if db_moving_element_order:
        db_moving_element_order.left_id = moving_item["left_id"]
        db_moving_element_order.right_id = moving_item["right_id"]
    else:
        create_order(moving_item["id"], moving_item["left_id"], moving_item["right_id"])


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
        order_class, order_query, deleting_item_id, get_item_order
    )

    # the validation that deleting_item_id exists and belongs to user is callers responsibility
    deleting_item_order = get_item_order(deleting_item_id)

    if deleting_item_order is not None:
        db.delete(deleting_item_order)


def _remove_item_from_sorted_items_in_position[
    TOrderedItemClass: OrderedItem
](
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    removing_item_id: int,
    get_item_order: Callable[[int], TOrderedItemClass | None],
):
    # the validation that removing_item_id exists and belongs to user is callers responsibility
    removing_item_order = get_item_order(removing_item_id)

    if removing_item_order is None:
        return

    if removing_item_order.left_id is not None:
        order_query.filter(order_class.left_id == removing_item_id).update(
            {"left_id": removing_item_order.left_id}
        )

    if removing_item_order.right_id is not None:
        order_query.filter(
            order_class.right_id == removing_item_id,
        ).update({"right_id": removing_item_order.right_id})

    removing_item_order.left_id = None
    removing_item_order.right_id = None
