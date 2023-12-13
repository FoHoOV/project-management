from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from api.routes import oath, tag, todo_item_comment
from config import settings
from db import init_db
from error.exceptions import UserFriendlyError

from .routes import todo_item, todo_category, user, project, error


def db_excepted_exception_handler(request: Request, ex: UserFriendlyError):
    return JSONResponse(
        status_code=400,
        content={"code": ex.code, "message": ex.description},
    )


def create_app():
    def custom_generate_unique_id(route: APIRoute):
        return f"{route.name}_{str(route.tags[0]).replace('-','_')}"

    app = FastAPI(generate_unique_id_function=custom_generate_unique_id)
    app.add_exception_handler(UserFriendlyError, db_excepted_exception_handler)

    app.include_router(oath.router)
    app.include_router(user.router)
    app.include_router(project.router)
    app.include_router(todo_category.router)
    app.include_router(todo_item.router)
    app.include_router(todo_item_comment.router)
    app.include_router(error.router)
    app.include_router(tag.router)

    app.openapi_version = (
        "3.0.0"  # TODO: bump to 3.1.0 when openapi-tools code generator supports it
    )

    origins = settings.ALLOWED_ORIGINS

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    init_db()

    return app
