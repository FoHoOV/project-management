from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, lazyload

from db.models.project import Project
from db.models.todo_category import TodoCategory
from db.models.todo_category_action import Action, TodoCategoryAction
from db.models.todo_category_order import TodoCategoryOrder
from db.models.todo_category_project_association import TodoCategoryProjectAssociation
from db.models.user import User
from db.models.user_project_permission import Permission
from db.schemas.todo_category import (
    TodoCategoryAttachAssociation,
    TodoCategoryCreate,
    TodoCategoryUpdateItem,
    TodoCategoryUpdateOrder,
)
from db.utils.project_crud import validate_project_belongs_to_user
from db.utils.shared.ordered_item import (
    delete_item_from_sorted_items,
    update_element_order,
)
from db.utils.shared.permission_query import (
    PermissionsType,
    join_with_permission_query_if_required,
    validate_item_exists_with_permissions,
)
from error.exceptions import ErrorCode, UserFriendlyError


def get_categories_for_project(db: Session, project_id: int, user_id: int):
    validate_project_belongs_to_user(
        db,
        project_id,
        user_id,
        None,
    )
    return (
        db.query(TodoCategory)
        .outerjoin(TodoCategory.orders.and_(TodoCategoryOrder.project_id == project_id))
        .join(TodoCategory.projects)
        .filter(Project.id == project_id)
        .order_by(TodoCategory.id.asc())
        .options(
            lazyload(
                TodoCategory.orders.and_(TodoCategoryOrder.project_id == project_id)
            )
        )  # TODO: see why the goblin do we need this to exist
        .all()
    )


def create(db: Session, category: TodoCategoryCreate, user_id: int):
    validate_project_belongs_to_user(
        db,
        category.project_id,
        user_id,
        [Permission.CREATE_TODO_CATEGORY],
    )

    db_item = TodoCategory(**category.model_dump())
    db.add(db_item)
    db.flush()

    association = TodoCategoryProjectAssociation(
        project_id=category.project_id, category_id=db_item.id
    )
    db.add(association)
    db.flush()

    update_order(
        db,
        db_item.id,
        TodoCategoryUpdateOrder.model_validate(
            {
                "left_id": _get_last_category_id_in_project_except_current(
                    db, db_item.id, category.project_id, user_id
                ),
                "right_id": None,
                "project_id": category.project_id,
            }
        ),
        user_id,
    )

    return db_item


def update_item(
    db: Session, category_id: int, category: TodoCategoryUpdateItem, user_id: int
):
    validate_todo_category_belongs_to_user(
        db, category_id, user_id, [Permission.UPDATE_TODO_CATEGORY]
    )

    db_item = db.query(TodoCategory).filter(TodoCategory.id == category_id).first()

    if db_item is None:
        raise UserFriendlyError(
            ErrorCode.TODO_CATEGORY_NOT_FOUND,
            "todo category doesn't exist or doesn't belong to user",
        )

    if category.description is not None:
        db_item.description = category.description

    if category.title is not None:
        db_item.title = category.title

    if category.actions is not None:
        _update_actions(db, db_item, category.actions)

    db.commit()
    return db_item


def update_order(
    db: Session, category_id: int, moving_item: TodoCategoryUpdateOrder, user_id: int
):
    required_permissions = [
        {Permission.UPDATE_TODO_CATEGORY, Permission.CREATE_TODO_CATEGORY}
    ]

    validate_todo_category_belongs_to_user(
        db,
        category_id,
        user_id,
        required_permissions,
    )
    if moving_item.left_id is not None:
        validate_todo_category_belongs_to_user(
            db, moving_item.left_id, user_id, required_permissions
        )
    if moving_item.right_id is not None:
        validate_todo_category_belongs_to_user(
            db, moving_item.right_id, user_id, required_permissions
        )
    validate_project_belongs_to_user(
        db,
        moving_item.project_id,
        user_id,
        required_permissions,
    )

    def create_order(id: int, left_id: int | None, right_id: int | None):
        db.add(
            TodoCategoryOrder(
                category_id=id,
                project_id=moving_item.project_id,
                left_id=left_id,
                right_id=right_id,
            )
        )

    update_element_order(
        db,
        TodoCategoryOrder,
        db.query(TodoCategoryOrder).filter(
            TodoCategoryOrder.project_id == moving_item.project_id
        ),
        TodoCategoryOrder.category_id,
        {
            "item_id": category_id,
            "left_id": moving_item.left_id,
            "right_id": moving_item.right_id,
        },
        create_order,
    )

    db.commit()

    item = db.query(TodoCategory).filter(TodoCategory.id == category_id).first()

    if item is None:
        raise

    return item


def attach_to_project(
    db: Session,
    category_id: int,
    association: TodoCategoryAttachAssociation,
    user_id: int,
):
    validate_todo_category_belongs_to_user(
        db,
        category_id,
        user_id,
        [Permission.UPDATE_TODO_CATEGORY],
    )
    validate_project_belongs_to_user(
        db,
        association.project_id,
        user_id,
        [Permission.UPDATE_TODO_CATEGORY],
    )

    association_db_item = TodoCategoryProjectAssociation(
        category_id=category_id, project_id=association.project_id
    )

    try:
        db.add(association_db_item)
        db.flush()
    except IntegrityError:
        raise UserFriendlyError(
            ErrorCode.CATEGORY_PROJECT_ASSOCIATION_ALREADY_EXISTS,
            "this category already belongs to this project",
        )

    update_order(
        db,
        category_id,
        TodoCategoryUpdateOrder.model_validate(
            {
                "left_id": None,
                "right_id": _get_first_category_id_in_project_except_current(
                    db, category_id, association.project_id, user_id
                ),
                "project_id": association.project_id,
            }
        ),
        user_id,
    )

    db.commit()
    return association_db_item


def detach_from_project(db: Session, category_id: int, project_id: int, user_id: int):
    validate_todo_category_belongs_to_user(
        db, category_id, user_id, [Permission.DELETE_TODO_CATEGORY]
    )
    validate_project_belongs_to_user(
        db,
        project_id,
        user_id,
        [Permission.DELETE_TODO_CATEGORY],
    )

    delete_item_from_sorted_items(
        db,
        TodoCategoryOrder,
        db.query(TodoCategoryOrder).filter(TodoCategoryOrder.project_id == project_id),
        TodoCategoryOrder.category_id,
        category_id,
    )

    db.query(TodoCategoryProjectAssociation).filter(
        TodoCategoryProjectAssociation.project_id == project_id,
        TodoCategoryProjectAssociation.category_id == category_id,
    ).delete()

    if (
        db.query(TodoCategoryProjectAssociation)
        .filter(TodoCategoryProjectAssociation.category_id == category_id)
        .count()
        == 0
    ):
        db.query(TodoCategory).filter(TodoCategory.id == category_id).delete()

    db.commit()


def validate_todo_category_belongs_to_user(
    db: Session,
    category_id: int,
    user_id: int,
    permissions: PermissionsType,
):
    query = (
        db.query(TodoCategory)
        .filter(TodoCategory.id == category_id)
        .join(TodoCategory.projects)
        .join(Project.users)
        .filter(User.id == user_id)
    )

    query = join_with_permission_query_if_required(query, permissions)

    validate_item_exists_with_permissions(
        query,
        permissions,
        ErrorCode.TODO_CATEGORY_NOT_FOUND,
        "todo category doesn't exist or doesn't belong to user or you don't have the permission to perform the requested action",
    )


def _update_actions(
    db: Session, todo_category: TodoCategory, toggle_actions: list[Action]
):

    def has_action(actions: list[TodoCategoryAction], action: Action):
        return len([_action for _action in actions if _action == action]) >= 1

    def validate_can_add_action(action: Action, todo_category: TodoCategory):
        match action:
            case Action.AUTO_MARK_AS_DONE:
                if len([item for item in todo_category.items if not item.is_done]) >= 1:
                    raise UserFriendlyError(
                        ErrorCode.CANT_CHANGE_ACTION,
                        "Cannot add this rule at the moment, because this category contains items that are not done yet",
                    )
            case Action.AUTO_MARK_AS_UNDONE:
                if len([item for item in todo_category.items if item.is_done]) >= 1:
                    raise UserFriendlyError(
                        ErrorCode.CANT_CHANGE_ACTION,
                        "Cannot add this rule at the moment, because this category contains items that are already marked as done",
                    )
            case _:
                raise UserFriendlyError(
                    ErrorCode.UNKNOWN_ERROR,
                    "This action's validations are not implemented yet",
                )

    for action in toggle_actions:
        if has_action(todo_category.actions, action):
            db.query(TodoCategoryAction).filter(
                TodoCategoryAction.category_id == todo_category.id,
                TodoCategoryAction.action == action,
            ).delete()
        else:
            validate_can_add_action(action, todo_category)
            db.add(TodoCategoryAction(category_id=todo_category.id, action=action))


def _get_last_category_id_in_project_except_current(
    db: Session, current_category_id: int, project_id: int, user_id: int
):
    last_item_in_the_list = (
        db.query(TodoCategoryOrder)
        .filter(
            TodoCategoryOrder.project_id == project_id,
            TodoCategoryOrder.right_id == None,
            TodoCategoryOrder.category_id != current_category_id,
        )
        .first()
    )

    if last_item_in_the_list is not None:
        return last_item_in_the_list.category_id

    categories = get_categories_for_project(db, project_id, user_id)
    if len(categories) > 0:
        if categories[-1].id != current_category_id:
            return categories[-1].id
        return categories[-2].id if len(categories) > 1 else None

    return None


def _get_first_category_id_in_project_except_current(
    db: Session, current_category_id: int, project_id: int, user_id: int
):
    first_item_in_the_list = (
        db.query(TodoCategoryOrder)
        .filter(
            TodoCategoryOrder.project_id == project_id,
            TodoCategoryOrder.left_id == None,
            TodoCategoryOrder.category_id != current_category_id,
        )
        .first()
    )

    if first_item_in_the_list is not None:
        return first_item_in_the_list.category_id

    categories = get_categories_for_project(db, project_id, user_id)
    if len(categories) > 0:
        if categories[0].id != current_category_id:
            return categories[0].id
        return categories[1].id if len(categories) > 1 else None

    return None
