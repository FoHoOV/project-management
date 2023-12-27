def pytest_configure():
    import config

    config.settings = config.Settings(_env_file=(".env", ".env.integration"))  # type: ignore
