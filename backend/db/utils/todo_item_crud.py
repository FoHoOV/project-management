from typing import List
from db.models.todo_category_action import Action
from db.models.todo_item_dependency import TodoItemDependency
from db.utils.shared.ordered_item import (
    delete_item_from_sorted_items,
    update_element_order,
)
from sqlalchemy.orm import Session
from db.models.project import Project
from db.models.todo_category import TodoCategory


from db.models.todo_item import TodoItem
from db.models.todo_item_order import TodoItemOrder
from db.models.user import User
from db.schemas.todo_item import (
    SearchTodoStatus,
    TodoItemAddDependency,
    TodoItemCreate,
    TodoItemDelete,
    TodoItemRemoveDependency,
    TodoItemUpdateItem,
    SearchTodoItemParams,
    TodoItemUpdateOrder,
)
from error.exceptions import ErrorCode, UserFriendlyError
from db.utils.project_crud import validate_project_belongs_to_user
from db.utils.todo_category_crud import validate_todo_category_belongs_to_user


def get_todos_for_user(
    db: Session, search_todo_params: SearchTodoItemParams, user_id: int
):
    validate_project_belongs_to_user(
        db,
        search_todo_params.project_id,
        user_id,
        user_id,
        True,
    )

    validate_todo_category_belongs_to_user(db, search_todo_params.category_id, user_id)

    query = db.query(TodoItem)

    if search_todo_params.status == SearchTodoStatus.DONE:
        query = query.filter(TodoItem.is_done == True)
    elif search_todo_params.status == SearchTodoStatus.PENDING:
        query = query.filter(TodoItem.is_done == False)

    return (
        query.join(TodoItem.category)
        .filter(TodoCategory.id == search_todo_params.category_id)
        .join(TodoCategory.projects)
        .filter(Project.id == search_todo_params.project_id)
        .join(Project.users)
        .filter(User.id == user_id)
        .order_by(TodoItem.id.desc())
        .all()
    )


def create(db: Session, todo: TodoItemCreate, user_id: int):
    validate_todo_category_belongs_to_user(db, todo.category_id, user_id)

    db_item = TodoItem(**todo.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    update_order(
        db,
        TodoItemUpdateOrder.model_validate(
            {
                "id": db_item.id,
                "right_id": None,
                "left_id": _get_last_todo_id_in_category_except_current(
                    db, db_item.id, todo.category_id
                ),
                "new_category_id": todo.category_id,
            }
        ),
        user_id,
    )
    return db_item


def update_item(db: Session, todo: TodoItemUpdateItem, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id)

    db_item = (
        db.query(TodoItem).filter(TodoItem.id == todo.id).join(TodoCategory).first()
    )

    if not db_item:
        raise UserFriendlyError(
            ErrorCode.TODO_NOT_FOUND,
            "todo item doesn't exist or doesn't belong to user",
        )

    if todo.new_category_id is not None:
        update_order(
            db,
            TodoItemUpdateOrder.model_validate(
                {
                    "id": db_item.id,
                    "right_id": None,
                    "left_id": _get_last_todo_id_in_category_except_current(
                        db, todo.id, todo.new_category_id
                    ),
                    "new_category_id": todo.new_category_id,
                }
            ),
            user_id,
        )
        db.refresh(db_item)

    if todo.is_done is not None:
        if todo.is_done:
            _validate_dependencies_are_resolved(db, db_item, user_id)
        db_item.is_done = todo.is_done
        _perform_actions(db, db_item, db_item.category_id, todo.is_done, user_id)

    if todo.description is not None:
        db_item.description = todo.description

    if todo.title is not None:
        db_item.title = todo.title

    db.commit()
    db.refresh(db_item)
    return db_item


def update_order(db: Session, moving_item: TodoItemUpdateOrder, user_id: int):
    validate_todo_item_belongs_to_user(db, moving_item.id, user_id)

    if moving_item.left_id is not None:
        validate_todo_item_belongs_to_user(db, moving_item.left_id, user_id)

    if moving_item.right_id is not None:
        validate_todo_item_belongs_to_user(db, moving_item.right_id, user_id)

    db_item = (
        db.query(TodoItem)
        .filter(TodoItem.id == moving_item.id)
        .join(TodoItem.category)
        .first()
    )

    if not db_item:
        raise UserFriendlyError(
            ErrorCode.TODO_NOT_FOUND, "moving item not found or doesn't belong to user"
        )

    if db_item.category_id != moving_item.new_category_id:
        _perform_actions(db, db_item, moving_item.new_category_id, None, user_id)
        validate_todo_category_belongs_to_user(db, moving_item.new_category_id, user_id)
        delete_item_from_sorted_items(
            db,
            TodoItemOrder,
            db.query(TodoItemOrder),
            TodoItemOrder.todo_id,
            db_item.id,
        )
        db_item.category_id = moving_item.new_category_id
        db.commit()

    def create_order(id: int, left_id: int | None, right_id: int | None):
        db.add(TodoItemOrder(todo_id=id, left_id=left_id, right_id=right_id))

    update_element_order(
        db,
        TodoItemOrder,
        db.query(TodoItemOrder),
        TodoItemOrder.todo_id,
        {
            "item_id": moving_item.id,
            "left_id": moving_item.left_id,
            "right_id": moving_item.right_id,
        },
        create_order,
    )

    db.commit()
    db.refresh(db_item)
    return db_item


def remove(db: Session, todo: TodoItemDelete, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id=user_id)
    db_item = db.query(TodoItem).filter(TodoItem.id == todo.id).first()
    if not db_item:
        return

    delete_item_from_sorted_items(
        db,
        TodoItemOrder,
        db.query(TodoItemOrder),
        TodoItemOrder.todo_id,
        todo.id,
    )

    db.query(TodoItem).filter(TodoItem.id == todo.id).delete()
    db.commit()


def add_todo_dependency(db: Session, dependency: TodoItemAddDependency, user_id: int):
    validate_todo_item_belongs_to_user(db, dependency.todo_id, user_id)
    validate_todo_item_belongs_to_user(db, dependency.dependant_todo_id, user_id)

    if (
        db.query(TodoItemDependency)
        .filter(
            TodoItemDependency.todo_id == dependency.todo_id,
            TodoItemDependency.dependant_todo_id == dependency.dependant_todo_id,
        )
        .count()
        > 0
    ):
        raise UserFriendlyError(
            ErrorCode.TODO_ITEM_DEPENDENCY_ALREADY_EXISTS,
            "This todo item dependency already exists",
        )

    todo = db.query(TodoItem).filter(TodoItem.id == dependency.todo_id).first()

    if todo is None:
        raise

    if todo.is_done:
        raise UserFriendlyError(
            ErrorCode.INVALID_INPUT,
            "You can not add a new dependency to an item that is marked as done",
        )

    todo.is_done = False

    db_item = TodoItemDependency(**dependency.model_dump())
    db.add(db_item)

    db.commit()
    db.refresh(db_item)

    return db_item


def remove_todo_dependency(
    db: Session, dependency: TodoItemRemoveDependency, user_id: int
):
    db_item = (
        db.query(TodoItemDependency)
        .filter(TodoItemDependency.id == dependency.dependency_id)
        .first()
    )

    if db_item is None:
        raise UserFriendlyError(
            ErrorCode.TODO_ITEM_DEPENDENCY_NOT_FOUND, "Dependency not found!"
        )

    validate_todo_item_belongs_to_user(db, db_item.todo_id, user_id)

    db.delete(db_item)
    db.commit()


def validate_todo_item_belongs_to_user(db: Session, todo_id: int, user_id: int):
    if (
        db.query(TodoItem)
        .filter(TodoItem.id == todo_id)
        .join(TodoItem.category)
        .join(TodoCategory.projects)
        .join(Project.users)
        .filter(User.id == user_id)
        .count()
        == 0
    ):
        raise UserFriendlyError(
            ErrorCode.TODO_NOT_FOUND,
            "todo item doesn't exist or doesn't belong to user",
        )


def _perform_actions(
    db: Session,
    todo_item: TodoItem,
    category_id: int,
    new_done_status: bool | None,
    user_id: int,
):
    new_category = db.query(TodoCategory).filter(TodoCategory.id == category_id).first()
    if not new_category:
        raise
    for action in new_category.actions:
        match action.action:
            case Action.AUTO_MARK_AS_DONE:
                if new_done_status is not None and new_done_status == False:
                    raise UserFriendlyError(
                        ErrorCode.ACTION_PREVENTED_TODO_UPDATE,
                        "This category has an action that prevents you from marking this todo as `UNDONE`",
                    )
                _validate_dependencies_are_resolved(db, todo_item, user_id)
                todo_item.is_done = True


def _validate_dependencies_are_resolved(db: Session, todo: TodoItem, user_id: int):
    for dependency in todo.dependencies:
        try:
            validate_todo_item_belongs_to_user(
                db, dependency.dependant_todo_id, user_id
            )
        except UserFriendlyError as e:
            raise UserFriendlyError(
                ErrorCode.TODO_NOT_FOUND,
                f"One or more dependencies don't belong to you anymore, please consider removing the dependency: #{dependency.todo_id} - {dependency.dependant_todo_title}",
            )
        if not dependency.dependant_todo.is_done:
            raise UserFriendlyError(
                ErrorCode.DEPENDENCIES_NOT_RESOLVED,
                "Cannot change todo status, because dependant todos are not done yet",
            )


def _get_last_todo_id_in_category_except_current(
    db: Session, current_todo_id: int, category_id: int
):
    last_item_in_the_list = (
        db.query(TodoItemOrder)
        .join(TodoItemOrder.todo)
        .join(TodoItem.category)
        .filter(TodoCategory.id == category_id)
        .filter(TodoItemOrder.right_id == None)
        .filter(TodoItemOrder.todo_id != current_todo_id)
        .first()
    )

    if last_item_in_the_list is not None:
        return last_item_in_the_list.todo_id

    last_item_in_the_list = (
        db.query(TodoItem)
        .join(TodoItem.category)
        .filter(TodoCategory.id == category_id)
        .filter(TodoItem.id != current_todo_id)
        .order_by(TodoItem.id.desc())
        .limit(0)
        .all()
    )
    if len(last_item_in_the_list) > 0:
        return last_item_in_the_list[0].id

    return None
