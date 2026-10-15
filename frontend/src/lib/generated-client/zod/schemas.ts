import { z } from "zod";

export const Body_login_for_access_token_OAuth = z.object({
  grant_type: z.union([z.string(), z.null()]).optional(),
  username: z.string(),
  password: z.string(),
  scope: z.string().optional().default(""),
  client_id: z.union([z.string(), z.null()]).optional(),
  client_secret: z.union([z.string(), z.null()]).optional(),
});
export const Token = z.object({
  access_token: z.string(),
  token_type: z.string(),
});
export const ValidationError = z.object({
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
  type: z.string(),
  input: z.unknown().optional(),
  ctx: z.object({}).partial().optional(),
});
export const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial();
export const UserCreate = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(72),
  confirm_password: z.string().min(5).max(72),
});
export const PartialProject = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
});
export const User = z.object({
  username: z.string().min(3).max(30),
  id: z.number().int(),
  projects: z.array(PartialProject).optional().default([]),
});
export const PartialTodoCategory = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
});
export const ProjectPartialTag = z.object({
  id: z.number().int(),
  name: z.string(),
});
export const Permission = z.enum([
  "create_todo_category",
  "update_todo_category",
  "delete_todo_category",
  "create_todo_item",
  "update_todo_item",
  "delete_todo_item",
  "create_todo_item_dependency",
  "update_todo_item_dependency",
  "delete_todo_item_dependency",
  "create_comment",
  "update_comment",
  "delete_comment",
  "create_tag",
  "update_tag",
  "delete_tag",
  "update_project",
  "all",
]);
export const PartialUserWithPermission = z.object({
  permissions: z.array(Permission).min(1),
  id: z.number().int(),
  username: z.string(),
});
export const Project = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  todo_categories: z.array(PartialTodoCategory),
  tags: z.array(ProjectPartialTag),
  done_todos_count: z.number().int(),
  pending_todos_count: z.number().int(),
  users: z.array(PartialUserWithPermission),
});
export const ProjectCreate = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(1).max(100),
  create_from_default_template: z.boolean().optional().default(false),
});
export const ProjectUpdate = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(1).max(100),
  create_from_default_template: z.boolean().optional().default(false),
});
export const ProjectAttachAssociation = z.object({
  permissions: z.array(Permission).min(1),
  username: z.string().min(3).max(100),
});
export const ProjectAttachAssociationResponse = z.object({
  project_id: z.number().int(),
  user_id: z.number().int(),
});
export const ProjectUpdateUserPermissions = z.object({
  permissions: z.array(Permission).min(1),
  user_id: z.number().int(),
});
export const TodoCategoryCreate = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
  project_id: z.number().int(),
});
export const NullableOrderedItem = z.object({
  right_id: z.union([z.number(), z.null()]),
  left_id: z.union([z.number(), z.null()]),
});
export const TodoItemPartialTag = z.object({
  id: z.number().int(),
  name: z.string(),
  project_id: z.number().int(),
});
export const TodoItemPartialDependency = z.object({
  id: z.number().int(),
  dependant_todo_id: z.number().int(),
  dependant_todo_title: z.string(),
});
export const TodoCategoryPartialUser = z.object({
  id: z.number().int(),
  username: z.string(),
});
export const TodoCategoryPartialTodoItem = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  is_done: z.boolean(),
  category_id: z.number().int(),
  due_date: z.union([z.string(), z.null()]).optional(),
  tags: z.array(TodoItemPartialTag),
  dependencies: z.array(TodoItemPartialDependency),
  order: NullableOrderedItem,
  comments_count: z.number().int(),
  marked_as_done_by: z.union([TodoCategoryPartialUser, z.null()]),
});
export const TodoCategoryPartialProject = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
});
export const Action = z.enum(["auto_mark_as_done", "auto_mark_as_undone"]);
export const TodoCategoryPartialAction = z.object({ action: Action });
export const TodoCategory = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
  id: z.number().int(),
  orders: z.array(NullableOrderedItem),
  items: z.array(TodoCategoryPartialTodoItem),
  projects: z.array(TodoCategoryPartialProject),
  actions: z.array(TodoCategoryPartialAction),
});
export const TodoCategoryAttachAssociation = z.object({
  project_id: z.number().int(),
});
export const TodoCategoryUpdateItem = z
  .object({
    title: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    actions: z.union([z.array(Action), z.null()]),
  })
  .partial();
export const TodoCategoryUpdateOrder = z.object({
  left_id: z.union([z.number(), z.null()]),
  right_id: z.union([z.number(), z.null()]),
  project_id: z.number().int(),
});
export const TodoCategoryUpdate = z
  .object({
    item: z.union([TodoCategoryUpdateItem, z.null()]),
    order: z.union([TodoCategoryUpdateOrder, z.null()]),
  })
  .partial();
export const TodoItemCreate = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
  is_done: z.boolean(),
  category_id: z.number().int(),
  due_date: z.union([z.string(), z.null()]).optional(),
});
export const TodoItemPartialProject = z.object({
  id: z.number().int(),
  title: z.string(),
});
export const TodoItemPartialCategory = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  projects: z.array(TodoItemPartialProject),
});
export const TodoItemPartialUser = z.object({
  id: z.number().int(),
  username: z.string(),
});
export const TodoItem = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
  is_done: z.boolean(),
  category_id: z.number().int(),
  due_date: z.union([z.string(), z.null()]).optional(),
  id: z.number().int(),
  category: TodoItemPartialCategory,
  tags: z.array(TodoItemPartialTag),
  dependencies: z.array(TodoItemPartialDependency),
  order: NullableOrderedItem,
  comments_count: z.number().int(),
  marked_as_done_by: z.union([TodoItemPartialUser, z.null()]),
});
export const TodoItemUpdateOrder = z.object({
  left_id: z.union([z.number(), z.null()]),
  right_id: z.union([z.number(), z.null()]),
  new_category_id: z.number().int(),
});
export const TodoItemUpdateItem = z
  .object({
    new_category_id: z.union([z.number(), z.null()]),
    title: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    due_date: z.union([z.string(), z.null()]),
    is_done: z.union([z.boolean(), z.null()]),
  })
  .partial();
export const TodoItemUpdate = z
  .object({
    order: z.union([TodoItemUpdateOrder, z.null()]),
    item: z.union([TodoItemUpdateItem, z.null()]),
  })
  .partial();
export const TodoItemAddDependency = z.object({
  dependant_todo_id: z.number().int(),
});
export const TodoCommentCreate = z.object({
  message: z.string().min(1).max(50000),
});
export const TodoComment = z.object({
  id: z.number().int(),
  todo_id: z.number().int(),
  message: z.string(),
});
export const TodoCommentUpdate = z.object({
  message: z.string().min(1).max(50000),
});
export const ErrorCode = z.enum([
  "unknown_error",
  "tag_not_found",
  "comment_not_found",
  "user_not_found",
  "username_already_exists",
  "todo_not_found",
  "todo_category_not_found",
  "project_not_found",
  "invalid_input",
  "user_association_already_exists",
  "tag_project_association_already_exists",
  "tag_todo_association_already_exists",
  "category_project_association_already_exists",
  "todo_item_dependency_already_exists",
  "todo_item_dependency_not_found",
  "dependencies_not_resolved",
  "todo_category_action_is_already_the_same",
  "cant_change_action",
  "action_prevented_todo_update",
  "permission_denied",
  "user_doesnt_have_access_to_project",
]);
export const UserFriendlyErrorSchema = z.object({
  code: ErrorCode,
  message: z.string(),
});
export const TagCreate = z.object({
  name: z.string().min(1).max(100),
  project_id: z.number().int(),
});
export const PartialTodo = z.object({
  id: z.number().int(),
  category_id: z.number().int(),
  title: z.string(),
  is_done: z.boolean(),
  description: z.string(),
});
export const Tag = z.object({
  id: z.number().int(),
  name: z.string(),
  project_id: z.number().int(),
  todos: z.array(PartialTodo),
});
export const project_id = z.union([z.number(), z.null()]).optional();
export const TagUpdate = z.object({
  name: z.string().min(1).max(100),
  project_id: z.number().int(),
});
export const TagDelete = z.object({ project_id: z.number().int() });
export const TagAttachToTodo = z.object({
  todo_id: z.number().int(),
  project_id: z.number().int(),
  create_if_doesnt_exist: z.boolean(),
});

export const login_for_access_token_OAuthSchema = {
  method: "post",
  path: "/oauth/token",
  alias: "login_for_access_token_OAuth",
  requestFormat: "form-url",
  body: Body_login_for_access_token_OAuth,
  response: Token,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const update_permissionsSchema = {
  method: "put",
  path: "/permissions/:project_id",
  alias: "update_permissions",
  requestFormat: "json",
  params: z.object({
    project_id: z.number().int(),
  }),
  body: ProjectUpdateUserPermissions,
  response: PartialUserWithPermission,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const list_projectsSchema = {
  method: "get",
  path: "/projects/",
  alias: "list_projects",
  requestFormat: "json",
  response: z.array(Project),
  errors: [],
} as const;

export const create_for_user_projectsSchema = {
  method: "post",
  path: "/projects/",
  alias: "create_for_user_projects",
  requestFormat: "json",
  body: ProjectCreate,
  response: Project,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const update_projectsSchema = {
  method: "patch",
  path: "/projects/:project_id",
  alias: "update_projects",
  requestFormat: "json",
  params: z.object({
    project_id: z.number().int(),
  }),
  body: ProjectUpdate,
  response: Project,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const filter_projectsSchema = {
  method: "get",
  path: "/projects/:project_id",
  alias: "filter_projects",
  requestFormat: "json",
  params: z.object({
    project_id: z.number().int(),
  }),
  response: Project,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const attach_to_user_projectsSchema = {
  method: "post",
  path: "/projects/:project_id/users",
  alias: "attach_to_user_projects",
  requestFormat: "json",
  params: z.object({
    project_id: z.number().int(),
  }),
  body: ProjectAttachAssociation,
  response: ProjectAttachAssociationResponse,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const detach_from_user_projectsSchema = {
  method: "delete",
  path: "/projects/:project_id/users/:user_id",
  alias: "detach_from_user_projects",
  requestFormat: "json",
  params: z.object({
    project_id: z.number().int(),
    user_id: z.number().int(),
  }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const detach_from_self_projectsSchema = {
  method: "delete",
  path: "/projects/:project_id/users/me",
  alias: "detach_from_self_projects",
  requestFormat: "json",
  params: z.object({
    project_id: z.number().int(),
  }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const create_tagsSchema = {
  method: "post",
  path: "/tags/",
  alias: "create_tags",
  requestFormat: "json",
  body: TagCreate,
  response: Tag,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const search_tagsSchema = {
  method: "get",
  path: "/tags/",
  alias: "search_tags",
  requestFormat: "json",
  query: z.object({
    name: z.string(),
    project_id: project_id,
  }),
  response: z.array(TodoItem),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const update_tagsSchema = {
  method: "put",
  path: "/tags/:tag_name",
  alias: "update_tags",
  requestFormat: "json",
  params: z.object({
    tag_name: z.string().min(1).max(100),
  }),
  body: TagUpdate,
  response: Tag,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const delete_tagsSchema = {
  method: "delete",
  path: "/tags/:tag_name",
  alias: "delete_tags",
  requestFormat: "json",
  params: z.object({
    tag_name: z.string().min(1).max(100),
  }),
  body: z.object({ project_id: z.number().int() }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const attach_to_todo_tagsSchema = {
  method: "post",
  path: "/tags/:tag_name/todo-items/",
  alias: "attach_to_todo_tags",
  requestFormat: "json",
  params: z.object({
    tag_name: z.string().min(1).max(100),
  }),
  body: TagAttachToTodo,
  response: Tag,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const detach_from_todo_tagsSchema = {
  method: "delete",
  path: "/tags/:tag_name/todo-items/:todo_id",
  alias: "detach_from_todo_tags",
  requestFormat: "json",
  params: z.object({
    tag_name: z.string().min(1).max(100),
    todo_id: z.number().int(),
  }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const create_for_user_todo_categoriesSchema = {
  method: "post",
  path: "/todo-categories/",
  alias: "create_for_user_todo_categories",
  requestFormat: "json",
  body: TodoCategoryCreate,
  response: TodoCategory,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const search_todo_categoriesSchema = {
  method: "get",
  path: "/todo-categories/",
  alias: "search_todo_categories",
  requestFormat: "json",
  query: z.object({
    project_id: z.number().int(),
  }),
  response: z.array(TodoCategory),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const update_todo_categoriesSchema = {
  method: "patch",
  path: "/todo-categories/:category_id",
  alias: "update_todo_categories",
  requestFormat: "json",
  params: z.object({
    category_id: z.number().int(),
  }),
  body: TodoCategoryUpdate,
  response: TodoCategory,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const attach_to_project_todo_categoriesSchema = {
  method: "post",
  path: "/todo-categories/:category_id/projects",
  alias: "attach_to_project_todo_categories",
  requestFormat: "json",
  params: z.object({
    category_id: z.number().int(),
  }),
  body: z.object({ project_id: z.number().int() }),
  response: z.object({ project_id: z.number().int() }),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const detach_from_project_todo_categoriesSchema = {
  method: "delete",
  path: "/todo-categories/:category_id/projects/:project_id",
  alias: "detach_from_project_todo_categories",
  requestFormat: "json",
  params: z.object({
    category_id: z.number().int(),
    project_id: z.number().int(),
  }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const create_for_user_todo_itemsSchema = {
  method: "post",
  path: "/todo-items/",
  alias: "create_for_user_todo_items",
  requestFormat: "json",
  body: TodoItemCreate,
  response: TodoItem,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const search_todo_itemsSchema = {
  method: "get",
  path: "/todo-items/",
  alias: "search_todo_items",
  requestFormat: "json",
  query: z.object({
    project_id: z.number().int(),
    category_id: z.number().int(),
    status: z.enum(["all", "done", "pending"]).optional(),
  }),
  response: z.array(TodoItem),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const update_todo_itemsSchema = {
  method: "patch",
  path: "/todo-items/:todo_id",
  alias: "update_todo_items",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
  }),
  body: TodoItemUpdate,
  response: TodoItem,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const remove_todo_itemsSchema = {
  method: "delete",
  path: "/todo-items/:todo_id",
  alias: "remove_todo_items",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
  }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const create_todo_item_commentsSchema = {
  method: "post",
  path: "/todo-items/:todo_id/comments",
  alias: "create_todo_item_comments",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
  }),
  body: z.object({ message: z.string().min(1).max(50000) }),
  response: TodoComment,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const list_todo_item_commentsSchema = {
  method: "get",
  path: "/todo-items/:todo_id/comments/",
  alias: "list_todo_item_comments",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
  }),
  response: z.array(TodoComment),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const update_todo_item_commentsSchema = {
  method: "put",
  path: "/todo-items/:todo_id/comments/:comment_id",
  alias: "update_todo_item_comments",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
    comment_id: z.number().int(),
  }),
  body: z.object({ message: z.string().min(1).max(50000) }),
  response: TodoComment,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const delete_todo_item_commentsSchema = {
  method: "delete",
  path: "/todo-items/:todo_id/comments/:comment_id",
  alias: "delete_todo_item_comments",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
    comment_id: z.number().int(),
  }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const add_todo_item_dependency_todo_itemsSchema = {
  method: "post",
  path: "/todo-items/:todo_id/dependencies",
  alias: "add_todo_item_dependency_todo_items",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
  }),
  body: z.object({ dependant_todo_id: z.number().int() }),
  response: TodoItemPartialDependency,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const remove_todo_item_dependency_todo_itemsSchema = {
  method: "delete",
  path: "/todo-items/:todo_id/dependencies/:dependent_todo_id",
  alias: "remove_todo_item_dependency_todo_items",
  requestFormat: "json",
  params: z.object({
    todo_id: z.number().int(),
    dependent_todo_id: z.number().int(),
  }),
  response: z.unknown(),
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;

export const include_error_types_typesSchema = {
  method: "get",
  path: "/types/errors",
  alias: "include_error_types_types",
  requestFormat: "json",
  response: UserFriendlyErrorSchema,
  errors: [],
} as const;

export const info_usersSchema = {
  method: "get",
  path: "/users/me",
  alias: "info_users",
  requestFormat: "json",
  response: User,
  errors: [],
} as const;

export const signup_usersSchema = {
  method: "post",
  path: "/users/signup",
  alias: "signup_users",
  requestFormat: "json",
  body: UserCreate,
  response: User,
  errors: [
    {
      status: 422,
      description: `Validation Error`,
      schema: HTTPValidationError,
    },
  ],
} as const;
