from __future__ import annotations
from enum import IntEnum


class ErrorCode(IntEnum):
    TAG_NOT_FOUND = 0
    COMMENT_NOT_FOUND = 1
    USER_NOT_FOUND = 2
    TODO_NOT_FOUND = 3
    TODO_CATEGORY_NOT_FOUND = 4
    PROJECT_NOT_FOUND = 5
    INVALID_INPUT = 6
    USER_ASSOCIATION_ALREADY_EXISTS = 7
    TAG_PROJECT_ASSOCIATION_ALREADY_EXISTS = 8
    TAG_TODO_ASSOCIATION_ALREADY_EXISTS = 9
    CATEGORY_PROJECT_ASSOCIATION_ALREADY_EXISTS = 10


class UserFriendlyError(Exception):
    def __init__(self, code: ErrorCode, description: str):
        self.code = code
        self.description = description
        super().__init__(description)
