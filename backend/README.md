This is the backend app for my project management app.

## Building the project

This project uses [uv](https://docs.astral.sh/uv/getting-started/installation/) and Python 3.14 (uv installs the right Python for you):

```bash
uv sync            # runtime + dev dependencies (linters, pytest)
uv sync --no-dev   # runtime dependencies only
```

## Add env variables

All required env variables are in .env.raw file. Create a new .env file from that template and fill in your own variables
For instance the final .env file in DEV mode would look like this (last update 2023/12/13):

```bash
# .env contents
ALLOWED_ORIGINS = ["http://localhost", "http://localhost:4173", "http://localhost:5173", "http://localhost:5174"]
SQLALCHEMY_DATABASE_URL = "sqlite:///./todos.db"
IS_SQLALCHEMY_LOG_ENABLED = True
```

## Running the project

If you are using vscode you can simply use the run&debug to run the backend app after doing the mentioned steps.
You can also run the app manually with:

```bash
uv run uvicorn main:app --reload --port 8080
```

After running the project goto
http://127.0.0.1:8080/docs
for a web based swagger docs.

## Tests

```bash
uv run pytest
```

Tests run against a temporary SQLite database. To run them against another database, set `TEST_DATABASE_URL` (that database is wiped at the start of the run).

The frontend's UI tests need a running backend connected to a throwaway database. Create a `.env.integration` file that overrides `SQLALCHEMY_DATABASE_URL`, and start the backend with it on port `8090` (the "integration" config in `.vscode/launch.json` does this).
