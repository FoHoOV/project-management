# backend/AGENTS.md

Shared rules (git workflow, commenting) are in the root [`AGENTS.md`](../AGENTS.md).

## Layout

Single FastAPI app; all commands run from `backend/`. Imports are absolute from `backend/` (`from db.models.user import User`, `from config import settings`).

| Path | Role |
| --- | --- |
| `main.py` | Entry point: `app = create_app()`. Used by uvicorn, Vercel (`vercel.json`) and Render (`render.yaml`). |
| `config.py` | `Settings` (pydantic-settings) loaded from `.env`. Module-level `settings` singleton. |
| `api/__init__.py` | `create_app()`: registers routers, CORS, the `UserFriendlyError` → HTTP 400 handler, and calls `init_db()`. Sets OpenAPI version to 3.0.0 for the frontend's code generator. |
| `api/routes/<resource>/<resource>.py` | One `APIRouter` per resource (`oauth`, `user`, `project`, `permission`, `todo_category`, `todo_item`, `todo_item_comment`, `tag`). Thin handlers that delegate to `db/utils/*_crud.py`. |
| `api/routes/error.py` | Dummy `/types/errors` endpoint that exists only to put `UserFriendlyErrorSchema` into `openapi.json`. |
| `api/dependencies/` | `get_db` (session per request) and `get_current_user` (JWT via `joserfc`, `OAuth2PasswordBearer` at `/oauth/token`). |
| `db/db.py`, `db/__init__.py` | Engine and session factory. SQLite gets `check_same_thread=False` and `PRAGMA foreign_keys=ON`. Tables are created with `Base.metadata.create_all` at startup. **There are no migrations (no Alembic).** |
| `db/models/` | SQLAlchemy 2.0 ORM models (`Mapped[...]`, `mapped_column`), one table per file. Bases are in `models/base.py`. |
| `db/schemas/` | Pydantic v2 request/response models (`XCreate`, `XUpdate`, `X`, ...). |
| `db/utils/*_crud.py` | Business logic and queries, as module-level functions taking `db: Session` first. `db/utils/shared/` holds the permission query helpers and the linked-list ordering (`ordered_item.py`). |
| `error/exceptions.py` | `ErrorCode` (StrEnum) and `UserFriendlyError(code, description)`. Raise this for expected failures. |
| `tests/` | pytest. `tests/api/routes/<resource>/test_<resource>.py` mirrors the routes. Fixtures are in `tests/api/fixtures/`. The test DB setup is in `tests/db/test.py`. |

Dependency direction: `api/routes` → `db/utils` → `db/models` + `db/schemas` + `error`. Routes don't query the DB directly.

## Tooling

From `Pipfile`, `.pylintrc` and `.github/workflows/test.yml`:

- Python `3.12` (`[requires]`). The code uses 3.12-only syntax, e.g. PEP 695 generics in `db/utils/shared/permission_query.py`.
- Package manager: **pipenv**. `Pipfile.lock` is committed.
  - Install: `pipenv install` (add `--dev` for black, isort, pylint, pytest).
- Env: copy `.env.raw` to `.env`. Required: `SECRET_KEY`, `SQLALCHEMY_DATABASE_URL`, `ALLOWED_ORIGINS` (JSON list), `IS_SQLALCHEMY_LOG_ENABLED`. Optional: `ALLOW_ORIGIN_REGEX`. `README.md`'s example `.env` omits `SECRET_KEY`, which the app needs to start.
- Dev server: `pipenv run uvicorn main:app --reload --port 8080`. Docs are at `/docs`. `.vscode/launch.json` also has an "integration" config on port 8090 that loads `.env.integration`.
- Tests: `pipenv run python -m pytest` (this is what CI runs).
  - `tests/conftest.py` rebuilds `config.settings` from `(".env", ".env.integration")` before the tests import anything. Put the test DB URL in `.env.integration`.
  - `tests/db/test.py` runs `Base.metadata.drop_all` on that DB at session start. Environment variables take priority over both files in pydantic-settings, so an exported `SQLALCHEMY_DATABASE_URL` is the DB that gets wiped.
  - Fixtures are session-scoped (`test_app`, `test_client`, autouse `test_users`) and are re-exported through `tests/api/conftest.py`.
- Lint/format: `black`, `isort`, `pylint`. Only pylint has repo config (`.pylintrc`: docstring checks disabled). black and isort run with defaults, triggered on save via `.vscode/settings.json`. There is no lint command in CI and no Makefile or task runner.
- Deploy: Vercel (`vercel.json`, `@vercel/python`) from the deploy workflows. `render.yaml` also exists for Render.

## Conventions observed in the code

- **FastAPI ~0.109, SQLAlchemy ~2.0, pydantic v2 / pydantic-settings ~2.0.**
- Dependencies use the `Annotated[..., Depends(...)]` style (the latest commit migrated to it). No `= Depends(...)` defaults remain.
- Route handlers are plain `def` (sync). `get_current_user` is `async`.
- Route handler names become OpenAPI operation IDs as `<function>_<tag>` (`custom_generate_unique_id`), and the frontend client method names come from those IDs. **Renaming a handler or tag changes the generated frontend API.** Some handlers shadow builtins (`filter`, `list` in `project.py`) for this reason.
- Errors: raise `UserFriendlyError(ErrorCode.X, "message")` from crud code. It becomes `400 {"code", "message"}`. New codes go in `ErrorCode`, and the frontend picks them up via the generated client.
- Permissions are checked inside crud functions via `db/utils/shared/permission_query.py` (`validate_item_exists_with_permissions`, `join_with_permission_query_if_required`), not in routes.
- Ordering of categories and items is a per-user doubly linked list (`left_id`/`right_id`, `BaseOrderedItem`, `*_order` tables).
- Naming: snake_case modules. Tables are snake_case singular (`todo_item`). Crud modules are `<resource>_crud.py`.
- Inconsistencies (don't copy them):
  - `api/routes/oauth/oath.py` and `db/utils/oatuh.py` are misspellings of "oauth".
  - `tests/api/fixtures/__index__.py` is not a package marker. The real fixture re-exports are in `tests/api/conftest.py`.
  - There is a stray `backend/__init__.py`.
  - `BasesWithCreatedDate.created_date` uses `default=datetime.now(UTC)`, which is evaluated once at import, not per row.
- Tests are API-level through `TestClient`. Responses are validated with `Schema.model_validate(..., strict=True)`. Request helpers are fixtures returning callables (e.g. `create_project_request(user, flag)`). Assertions carry a message string.
