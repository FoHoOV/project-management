from ast import Call
from dataclasses import dataclass
from tkinter import NO
from typing import Callable, Type, TypedDict
from sqlalchemy.orm import DeclarativeBase, Mapped, Query, Session, MappedColumn

# I have an ordered list of items, and the type of these items is defined as follows:

# ```typescript
# type Item {
#     id: number;
#     next: number | null;
# }
# ```

# Here, `id` is unique, and the mentioned list is initially ordered by `id`. The `next` property represents the ID of the next item in the list, and it may be `null`. Let's discuss the purpose of the `next` property. If a user wishes to create a custom order for this list, they can do so by setting the `next` value.

# For example, consider the following list:

# ```typescript
# const myList = [
#     { id: 5, next: null },
#     { id: 4, next: null },
#     { id: 2, next: null },
#     { id: 1, next: 5 }
# ];
# ```

# To order this list, it should become:

# ```typescript
# const orderedList = [
#     { id: 5, next: null },
#     { id: 1, next: 5 },
#     { id: 4, next: null },
#     { id: 2, next: null }
# ];
# ```

# Essentially, what happens is that we initially order the list by `id`, and then we rearrange the elements based on the `next` property. If `next` points to item `a`, the mentioned item should be exactly below item `a`. Additionally, there are constraints: for each list, the `next` value is unique throughout the entire list.

# Consider another example:

# ```typescript
# const myList = [
#     { id: 5, next: null },
#     { id: 4, next: 1 },
#     { id: 2, next: null },
#     { id: 1, next: 5 }
# ];
# ```

# The ordered list would be:

# ```typescript
# const orderedList = [
#     { id: 5, next: null },
#     { id: 1, next: 5 },
#     { id: 4, next: 1 },
#     { id: 2, next: null }
# ];
# ```

# So I want to prioritize the ordering based on the 'next' property when it is not null.
# This requires that next values don't create a cyclic order and hopefully we are taking that into account.


class OrderedItem(DeclarativeBase):
    next_id: MappedColumn[int | None]
    moving_id: MappedColumn[int]


class NewOrder(TypedDict):
    id: int
    next_id: int


def update_element_order[
    TOrderedItemClass: OrderedItem
](
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    moving_id: int,
    new_order: NewOrder,
    create_order: Callable[[int, int, int | None], None],
    get_item_order: Callable[[int], TOrderedItemClass | None],
    get_item_id: Callable[[TOrderedItemClass], int],
):
    # the validation that moving_id, id, next_id exists and belongs to user is callers responsibility
    db_moving_element = get_item_order(moving_id)

    _remove_item_from_sorted_items_in_position(
        order_class, order_query, moving_id, get_item_order, get_item_id
    )

    if moving_id == new_order["id"]:
        # X 4 3 2 1 Y
        # 4 -> 1 with (moving = 4): X 3 2 4 1 Y
        # or
        # X 4 3 2 1 Y
        # 1 -> 4 with (moving = 1): X 1 4 3 2 Y
        existing_element_pointing_to_new_next = order_query.filter(
            order_class.next_id == new_order["next_id"]
        ).first()

        if existing_element_pointing_to_new_next is not None:
            existing_element_pointing_to_new_next.next_id = moving_id
            if existing_element_pointing_to_new_next.moving_id == new_order["next_id"]:
                existing_element_pointing_to_new_next.moving_id = moving_id

        if db_moving_element is None:
            create_order(moving_id, moving_id, new_order["next_id"])
        else:
            db_moving_element.next_id = new_order["next_id"]
            db_moving_element.moving_id = moving_id
    elif moving_id == new_order["next_id"]:
        # X 4 3 2 1 Y
        # 4 -> 1 with (moving = 1): X 4 1 3 2 Y
        # or
        # X 4 3 2 1 Y
        # 1 -> 4 with (moving = 4): X 3 2 1 4 Y

        element_with_new_order_id = get_item_order(new_order["id"])

        moving_element_moving_id = None
        if element_with_new_order_id is None or (
            element_with_new_order_id is not None
            and element_with_new_order_id.moving_id == new_order["id"]
        ):
            moving_element_moving_id = moving_id
        else:
            moving_element_moving_id = element_with_new_order_id.moving_id

        if db_moving_element is None and element_with_new_order_id is not None:
            create_order(
                moving_id, moving_element_moving_id, element_with_new_order_id.next_id
            )
        elif db_moving_element is not None:
            db_moving_element.next_id = (
                element_with_new_order_id.next_id
                if element_with_new_order_id is not None
                else None
            )
            db_moving_element.moving_id = moving_element_moving_id

        if element_with_new_order_id is None:
            create_order(new_order["id"], moving_id, moving_id)
        else:
            element_with_new_order_id.next_id = moving_id
            element_with_new_order_id.moving_id = moving_id
    else:
        raise Exception("unhandled sorting case")


def delete_item_from_sorted_items[
    TOrderedItemClass: OrderedItem
](
    db: Session,
    order_class: Type[TOrderedItemClass],
    order_query: Query[TOrderedItemClass],
    deleting_item_id: int,
    get_item_order: Callable[[int], TOrderedItemClass | None],
    get_item_id: Callable[[TOrderedItemClass], int],
):
    _remove_item_from_sorted_items_in_position(
        order_class, order_query, deleting_item_id, get_item_order, get_item_id
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
    get_item_id: Callable[[TOrderedItemClass], int],
):
    # the validation that removing_item_id exists and belongs to user is callers responsibility
    removing_item_order = get_item_order(removing_item_id)

    exiting_item_pointing_to_removing_item = order_query.filter(
        order_class.next_id == removing_item_id,
    ).first()

    if exiting_item_pointing_to_removing_item is None:
        return

    moving_id = None
    if exiting_item_pointing_to_removing_item.moving_id == removing_item_id:
        moving_id = get_item_id(exiting_item_pointing_to_removing_item)
    else:
        moving_id = (
            removing_item_order.next_id
            if removing_item_order is not None
            and removing_item_order.next_id is not None
            else get_item_id(exiting_item_pointing_to_removing_item)
        )
    exiting_item_pointing_to_removing_item.next_id = (
        removing_item_order.next_id if removing_item_order is not None else None
    )
    exiting_item_pointing_to_removing_item.moving_id = moving_id
