import os
import tempfile
from pathlib import Path

from config import get_settings

_TEST_DATABASE_URL_ENV = "TEST_DATABASE_URL"


def pytest_configure():
    # Every DB consumer reads the URL lazily through get_settings(), and env vars
    # override .env, so this guarantees the suite never touches the dev database.
    test_database_url = os.environ.get(_TEST_DATABASE_URL_ENV)
    if not test_database_url:
        test_database_path = Path(tempfile.mkdtemp()) / "test.db"
        test_database_url = f"sqlite:///{test_database_path}"

    os.environ["SQLALCHEMY_DATABASE_URL"] = test_database_url
    get_settings.cache_clear()
