from db.utils.exceptions import UserFriendlyError
from sqlalchemy.orm import DeclarativeBase, Mapped, Query, Session

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
    id: Mapped[int]
    next_id: Mapped[int]


class QueryClass(DeclarativeBase):
    id: Mapped[int]
    order: Mapped[OrderedItem | None]


class NewOrder:
    id: int
    next_id: int


def update_element_order[
    TQueryClass: QueryClass, TOrderedItemClass: OrderedItem
](
    db: Session,
    query_class: TQueryClass,
    order_class: TOrderedItemClass,
    order_query: Query[TOrderedItemClass],
    moving_id: int,
    new_order: NewOrder,
    get_next_id,
    create_order,
):
    db_moving_element = db.query(QueryClass).filter(query_class.id == moving_id).first()

    if not db_moving_element:
        raise UserFriendlyError("The item that you are trying to move wasn't found")

    db.query(order_class.next_id == moving_id).update(
        {"next_id": get_next_id(db_moving_element)}
    )

    if moving_id == new_order.id:
        # X 4 3 2 1 Y
        # 4 -> 1 with (moving = 4): X 3 2 4 1 Y
        # or
        # X 4 3 2 1 Y
        # 1 -> 4 with (moving = 1): X 1 4 3 2 Y
        order_query.filter(order_class.next_id == new_order.id).update(
            {"next_id": moving_id}
        )

        if db_moving_element is None:
            create_order(moving_id, new_order.id)
        else:
            db_moving_element.next_id = new_order.id
    else:
        # X 4 3 2 1 Y
        # 4 -> 1 with (moving = 1): X 4 1 3 2 Y
        # or
        # X 4 3 2 1 Y
        # 1 -> 4 with (moving = 4): X 3 2 1 4 Y
        element_with_new_order_id = order_query.filter(
            order_class.id == new_order.id
        ).first()

        if db_moving_element is None:
            create_order(moving_id, get_next_id(element_with_new_order_id))
        else:
            db_moving_element.next_id = get_next_id(element_with_new_order_id)

        if element_with_new_order_id is None:
            create_order(new_order.id, moving_id)
        else:
            element_with_new_order_id.next_id = moving_id
