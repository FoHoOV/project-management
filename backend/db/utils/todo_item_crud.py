from unicodedata import category
from sqlalchemy.orm import Session
from db.models.project import Project
from db.models.project_user_association import ProjectUserAssociation
from db.models.todo_category import TodoCategory
from db.models.todo_category_project_association import TodoCategoryProjectAssociation


from db.models.todo_item import TodoItem
from db.models.user import User
from db.schemas.project import ProjectUserAssociationValidation
from db.schemas.todo_item import (
    SearchTodoStatus,
    TodoItemCreate,
    TodoItemDelete,
    TodoItemUpdate,
    SearchTodoItemParams,
)
from db.utils.project_crud import validate_project_belong_to_user
from db.utils.todo_category_crud import validate_todo_category_belongs_to_user


def get_todos_for_user(
    db: Session, search_todo_params: SearchTodoItemParams, user_id: int
):
    validate_project_belong_to_user(
        db,
        ProjectUserAssociationValidation(
            project_id=search_todo_params.project_id, user_id=user_id
        ),
        user_id,
        True,
    )

    query = db.query(TodoItem)

    if search_todo_params.status == SearchTodoStatus.DONE:
        query = query.filter(TodoItem.is_done == True)
    elif search_todo_params.status == SearchTodoStatus.PENDING:
        query = query.filter(TodoItem.is_done == False)

    return (
        query.join(User)
        .filter(User.id == user_id)
        .join(Project)
        .filter(Project.id == search_todo_params.project_id)
        .order_by(TodoItem.id.desc())
        .all()
    )


def create(db: Session, todo: TodoItemCreate, user_id: int):
    validate_todo_category_belongs_to_user(db, todo.category_id, user_id)

    db_item = TodoItem(**todo.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update(db: Session, todo: TodoItemUpdate, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id)

    db_item = (
        db.query(TodoItem)
        .filter(TodoItem.id == todo.id)
        .join(TodoCategory)
        .filter(TodoCategory.id == todo.category_id)
        .first()
    )

    if not db_item:
        return None

    db_item.is_done = todo.is_done
    db_item.description = todo.description
    db_item.title = todo.title

    db.commit()
    db.refresh(db_item)
    return db_item


def remove(db: Session, todo: TodoItemDelete, user_id: int):
    validate_todo_item_belongs_to_user(db, todo.id, user_id=user_id)

    row_count = db.query(TodoItem).filter(TodoItem.id == todo.id).delete()
    db.commit()
    return row_count


def validate_todo_item_belongs_to_user(db: Session, todo_id: int, user_id: int):
    if (
        db.query(TodoItem)
        .filter(TodoItem.id == todo_id)
        .join(TodoCategory)
        .join(TodoCategoryProjectAssociation)
        .join(ProjectUserAssociation)
        .filter(ProjectUserAssociation.user_id == user_id)
        .first()
        is None
    ):
        raise Exception("todo item doesn't exist or doesn't belong to user")
