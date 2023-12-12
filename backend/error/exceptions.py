from __future__ import annotations
from enum import IntEnum, StrEnum, auto


class ErrorCode(StrEnum):
    UNKNOWN_ERROR = auto()
    TAG_NOT_FOUND = auto()
    COMMENT_NOT_FOUND = auto()
    USER_NOT_FOUND = auto()
    TODO_NOT_FOUND = auto()
    TODO_CATEGORY_NOT_FOUND = auto()
    PROJECT_NOT_FOUND = auto()
    INVALID_INPUT = auto()
    USER_ASSOCIATION_ALREADY_EXISTS = auto()
    TAG_PROJECT_ASSOCIATION_ALREADY_EXISTS = auto()
    TAG_TODO_ASSOCIATION_ALREADY_EXISTS = auto()
    CATEGORY_PROJECT_ASSOCIATION_ALREADY_EXISTS = auto()


class UserFriendlyError(Exception):
    def __init__(self, code: ErrorCode, description: str):
        self.code = code
        self.description = description
        super().__init__(description)
