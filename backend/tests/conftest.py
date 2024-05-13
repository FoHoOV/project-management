def pytest_addoption():
    import config

    config.settings = config.Settings(_env_file=(".env", ".env.integration"))  # type: ignore
