from re import I
import typing
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from .routes.oauth import oath
from .routes.user import user
from .routes.project import project
from .routes.permission import permission
from .routes.todo_category import todo_category
from .routes.todo_item import todo_item
from .routes.tag import tag
from .routes.todo_item_comment import todo_item_comment
from .routes import error
from config import settings
from db import init_db
from error.exceptions import UserFriendlyError


def db_excepted_exception_handler(request: Request, ex: Exception):
    return JSONResponse(
        status_code=400,
        content={
            "code": typing.cast(UserFriendlyError, ex).code,
            "message": typing.cast(UserFriendlyError, ex).description,
        },
    )


def create_app():
    def custom_generate_unique_id(route: APIRoute):
        return f"{route.name}_{str(route.tags[0]).replace('-','_')}"

    app = FastAPI(generate_unique_id_function=custom_generate_unique_id)

    app.add_exception_handler(UserFriendlyError, db_excepted_exception_handler)

    app.include_router(oath.router)
    app.include_router(user.router)
    app.include_router(project.router)
    app.include_router(permission.router)
    app.include_router(todo_category.router)
    app.include_router(todo_item.router)
    app.include_router(todo_item_comment.router)
    app.include_router(error.router)
    app.include_router(tag.router)

    app.openapi_version = (
        "3.0.0"  # TODO: bump to 3.1.0 when openapi-tools code generator supports it
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    init_db()

    return app
