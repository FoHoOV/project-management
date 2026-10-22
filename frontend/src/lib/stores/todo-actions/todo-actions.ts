import type {
	TodoCategory,
	TodoCategoryPartialTodoItem,
	TodoComment,
	TodoItem,
	TodoItemPartialTag
} from '#lib/generated-client/index.js';
import type { StrictUnion } from '#lib/utils/types/index.js';
import type { TodoComments } from '../todo-comments';

export type TodoActions = {
	editTodoCategory: (category: TodoCategory) => void;
	attachToProject: (category: TodoCategory) => void;
	createTodoItem: (category: TodoCategory) => void;
	editTodoItem: (todo: StrictUnion<TodoItem | TodoCategoryPartialTodoItem>) => void;
	addDependency: (todo: TodoCategoryPartialTodoItem) => void;
	createComment: (todoId: number, store: TodoComments) => void;
	editComment: (comment: TodoComment, store: TodoComments) => void;
	addTag: (todo: TodoCategoryPartialTodoItem) => void;
	editTag: (tag: TodoItemPartialTag) => void;
};
