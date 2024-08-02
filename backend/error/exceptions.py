from __future__ import annotations

from enum import IntEnum, StrEnum, auto


class ErrorCode(StrEnum):
    UNKNOWN_ERROR = auto()
    TAG_NOT_FOUND = auto()
    COMMENT_NOT_FOUND = auto()
    USER_NOT_FOUND = auto()
    USERNAME_ALREADY_EXISTS = auto()
    TODO_NOT_FOUND = auto()
    TODO_CATEGORY_NOT_FOUND = auto()
    PROJECT_NOT_FOUND = auto()
    INVALID_INPUT = auto()
    USER_ASSOCIATION_ALREADY_EXISTS = auto()
    TAG_PROJECT_ASSOCIATION_ALREADY_EXISTS = auto()
    TAG_TODO_ASSOCIATION_ALREADY_EXISTS = auto()
    CATEGORY_PROJECT_ASSOCIATION_ALREADY_EXISTS = auto()
    TODO_ITEM_DEPENDENCY_ALREADY_EXISTS = auto()
    TODO_ITEM_DEPENDENCY_NOT_FOUND = auto()
    DEPENDENCIES_NOT_RESOLVED = auto()
    TODO_CATEGORY_ACTION_IS_ALREADY_THE_SAME = auto()
    CANT_CHANGE_ACTION = auto()
    ACTION_PREVENTED_TODO_UPDATE = auto()
    PERMISSION_DENIED = auto()
    USER_DOESNT_HAVE_ACCESS_TO_PROJECT = auto()


class UserFriendlyError(Exception):
    def __init__(self, code: ErrorCode, description: str):
        self.code = code
        self.description = description
        super().__init__(description)
