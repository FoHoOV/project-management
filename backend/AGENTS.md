# backend/AGENTS.md

Shared rules (git workflow, commenting) are in the root [`AGENTS.md`](../AGENTS.md).

## Layout

Single FastAPI app; all commands run from `backend/`. Imports are absolute from `backend/` (`from db.models.user import User`, `from config import get_settings`).

| Path | Role |
| --- | --- |
| `main.py` | Entry point: `app = create_app()`. Used by uvicorn and Vercel (`vercel.json`). |
| `config.py` | `Settings` (pydantic-settings) loaded from `.env`, accessed through the cached `get_settings()`. Never read settings at import time; call `get_settings()` where the value is used. |
| `api/__init__.py` | `create_app()`: registers routers, CORS, the `UserFriendlyError` → HTTP 400 handler, and runs the migrations (`run_migrations()`). Publishes OpenAPI 3.1 (FastAPI's default); the frontend's generator relies on it. |
| `api/routes/<resource>/<resource>.py` | One `APIRouter` per resource (`oauth`, `user`, `project`, `permission`, `todo_category`, `todo_item`, `todo_item_comment`, `tag`). Thin handlers that delegate to `db/utils/*_crud.py`. |
| `api/routes/error.py` | Dummy `/types/errors` endpoint that exists only to put `UserFriendlyErrorSchema` into `openapi.json`. |
| `api/dependencies/` | `get_db` (session per request) and `get_current_user` (JWT via `joserfc`, `OAuth2PasswordBearer` at `/oauth/token`). |
| `db/db.py`, `db/__init__.py` | Engine and session factory, created lazily on first use (`get_engine()`, `get_session_factory()`). SQLite gets `check_same_thread=False` and `PRAGMA foreign_keys=ON`. |
| `db/migrations.py`, `migrations/`, `alembic.ini` | Alembic. `create_app()` runs `alembic upgrade head` at startup (`run_migrations()`), holding a Postgres advisory lock so concurrent cold starts migrate once. `migrations/env.py` takes the DB URL from `get_settings()` and imports every module in `db/models`. |
| `db/models/` | SQLAlchemy 2.0 ORM models (`Mapped[...]`, `mapped_column`), one table per file. Bases are in `models/base.py`. |
| `db/schemas/` | Pydantic v2 request/response models (`XCreate`, `XUpdate`, `X`, ...). |
| `db/utils/*_crud.py` | Business logic and queries, as module-level functions taking `db: Session` first. `db/utils/shared/` holds the permission query helpers and the linked-list ordering (`ordered_item.py`). |
| `error/exceptions.py` | `ErrorCode` (StrEnum) and `UserFriendlyError(code, description)`. Raise this for expected failures. |
| `tests/` | pytest. `tests/api/routes/<resource>/test_<resource>.py` mirrors the routes. Fixtures are in `tests/api/fixtures/`. The test DB setup is in `tests/conftest.py` and `tests/api/fixtures/app.py`. `tests/db/test_migrations.py` fails if the models and migrations differ. |

Dependency direction: `api/routes` → `db/utils` → `db/models` + `db/schemas` + `error`. Routes don't query the DB directly.

## Tooling

From `pyproject.toml`, `.python-version`, `.pylintrc` and `.github/workflows/test.yml`:

- Python `3.14` (`.python-version`, `requires-python`). The code uses 3.12+ syntax, e.g. PEP 695 generics in `db/utils/shared/permission_query.py`.
- Package manager: **uv**. `uv.lock` is committed. Not an installable package (`tool.uv.package = false`).
  - Install: `uv sync` (includes the `dev` group: black, isort, pylint, pytest, httpx2). `uv sync --no-dev` for runtime only, which is what Vercel installs.
  - Add a dependency: `uv add <pkg>` (or `uv add --dev <pkg>`). Don't edit `uv.lock` by hand.
- Env: copy `.env.raw` to `.env`. Required: `SECRET_KEY`, `SQLALCHEMY_DATABASE_URL`, `ALLOWED_ORIGINS` (JSON list), `IS_SQLALCHEMY_LOG_ENABLED`. Optional: `ALLOW_ORIGIN_REGEX`. `README.md`'s example `.env` omits `SECRET_KEY`, which the app needs to start.
- Dev server: `uv run uvicorn main:app --reload --port 8080`. Docs are at `/docs`. `.vscode/launch.json` also has an "integration" config on port 8090 that loads `.env.integration`.
- Tests: `uv run pytest` (this is what CI runs). `pyproject.toml` sets `pythonpath = ["."]` so tests import `config`, `db`, ... from `backend/`.
  - Tests use a fresh temporary SQLite DB by default. Set `TEST_DATABASE_URL` to run them against another DB (e.g. Postgres). That DB is wiped (`drop_all`) at session start. `tests/conftest.py` forces `SQLALCHEMY_DATABASE_URL` to the test URL, so the dev DB from `.env` or an exported `SQLALCHEMY_DATABASE_URL` is never touched.
  - Other settings (`SECRET_KEY`, ...) still come from `.env` or the environment.
  - The tests go through the real `get_db` dependency (no override).
  - Fixtures are session-scoped (`test_app`, `test_client`, autouse `test_users`) and are re-exported through `tests/api/conftest.py`.
- Lint/format: `black`, `isort`, `pylint`. Config: `.pylintrc` (docstring checks disabled), `[tool.black]` and `[tool.isort]` (`profile = "black"`) in `pyproject.toml`. Run with `uv run black .`, `uv run isort .`, `uv run pylint api db error tests`. VS Code runs black and isort on save (`.vscode/settings.json`). There is no lint command in CI and no Makefile or task runner.
- Migrations (Alembic):
  - After changing a model: `uv run alembic revision --autogenerate -m "<what changed>"`, then review the generated file. Autogenerate misses some changes (e.g. renames, some type changes).
  - Apply locally: `uv run alembic upgrade head`, or just start the app.
  - Never edit a migration that has already been deployed; add a new one.
  - SQLite runs migrations in batch mode (`render_as_batch`) so `ALTER` works.
- Deploy: Vercel (`vercel.json`, `@vercel/python`) from the deploy workflows. The Vercel builder installs from `uv.lock` without the dev group and picks the Python version from `.python-version`.

## Conventions observed in the code

- **FastAPI 0.143, SQLAlchemy 2.1, pydantic 2 / pydantic-settings 2.16, joserfc 1.x, bcrypt 5.**
- Dependencies use the `Annotated[..., Depends(...)]` style (the latest commit migrated to it). No `= Depends(...)` defaults remain.
- Route handlers are plain `def` (sync). `get_current_user` is `async`.
- Route handler names become OpenAPI operation IDs as `<function>_<tag>` (`custom_generate_unique_id`), and the frontend client method names come from those IDs. **Renaming a handler or tag changes the generated frontend API.** Some handlers shadow builtins (`filter`, `list` in `project.py`) for this reason.
- Errors: raise `UserFriendlyError(ErrorCode.X, "message")` from crud code. It becomes `400 {"code", "message"}`. New codes go in `ErrorCode`, and the frontend picks them up via the generated client.
- Permissions are checked inside crud functions via `db/utils/shared/permission_query.py` (`validate_item_exists_with_permissions`, `join_with_permission_query_if_required`), not in routes.
- Ordering of categories and items is a per-user doubly linked list (`left_id`/`right_id`, `BaseOrderedItem`, `*_order` tables).
- Naming: snake_case modules. Tables are snake_case singular (`todo_item`). Crud modules are `<resource>_crud.py`.
- Inconsistencies (don't copy them):
  - `api/routes/oauth/oath.py` and `db/utils/oatuh.py` are misspellings of "oauth".
  - `BasesWithCreatedDate.created_date` uses `default=datetime.now(UTC)`, which is evaluated once at import, not per row.
- Tests are API-level through `TestClient`. Responses are validated with `Schema.model_validate(..., strict=True)`. Request helpers are fixtures returning callables (e.g. `create_project_request(user, flag)`). Assertions carry a message string.
