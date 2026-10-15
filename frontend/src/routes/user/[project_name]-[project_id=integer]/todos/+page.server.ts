import { type Actions } from '@sveltejs/kit';
import { validateFormActionRequest, namedActionResult } from '$lib/actions/form';
import {
	addTagSchema,
	addTodoItemDependencySchema,
	attachToProjectSchema,
	createTodoCategorySchema,
	createTodoCommentSchema,
	createTodoItemSchema,
	editTagSchema,
	editTodoCategorySchema,
	editTodoCommentSchema,
	editTodoItemSchema
} from './validator';
import {
	TodoItemCreate,
	TodoCategoryCreate,
	TodoCategoryAttachAssociation,
	TodoCategoryUpdateItem,
	TodoItemUpdateItem,
	TodoCommentCreate,
	TodoCommentUpdate,
	TagAttachToTodo,
	TagUpdate,
	TodoItemAddDependency
} from '$lib/generated-client/zod.gen';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';
import { createApiClient } from '$lib/client-wrapper/clients';
import {
	addTodoItemDependencyTodoItems,
	attachToProjectTodoCategories,
	attachToTodoTags,
	createForUserTodoCategories,
	createForUserTodoItems,
	createTodoItemComments,
	updateTags,
	updateTodoCategories,
	updateTodoItemComments,
	updateTodoItems
} from '$lib/generated-client';

// TODO: probably should separate these to their own routes (todo/[edit|create] or category/[edit]/create, ...)
// with the new shallow routing I can separate the associated components as well (but i'll w8 for the svelte5 for the big refactor)
export const actions: Actions = {
	addTodo: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, createTodoItemSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await createForUserTodoItems({
					client: createApiClient({ token: locals.token, fetch }),
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoItemCreate
		});

		return namedActionResult(result, 'addTodo');
	},
	createCategory: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, createTodoCategorySchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await createForUserTodoCategories({
					client: createApiClient({ token: locals.token, fetch }),
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoCategoryCreate
		});

		return namedActionResult(result, 'createCategory');
	},
	attachToProject: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, attachToProjectSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await attachToProjectTodoCategories({
					client: createApiClient({ token: locals.token, fetch }),
					path: { category_id: validation.data.category_id },
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoCategoryAttachAssociation
		});

		return namedActionResult(result, 'attachToProject');
	},
	editTodoCategory: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, editTodoCategorySchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await updateTodoCategories({
					client: createApiClient({ token: locals.token, fetch }),
					path: { category_id: validation.data.id },
					body: { item: validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoCategoryUpdateItem
		});

		return namedActionResult(result, 'editTodoCategory');
	},
	editTodoItem: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, editTodoItemSchema);

		if (!validation.success) {
			return validation.failure;
		}

		if (!validation.data.due_date) {
			const date = new Date(0);
			date.setFullYear(1, 0, 1);
			validation.data.due_date = date;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await updateTodoItems({
					client: createApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.id },
					body: { item: validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoItemUpdateItem
		});

		return namedActionResult(result, 'editTodoItem');
	},
	createTodoComment: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, createTodoCommentSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await createTodoItemComments({
					client: createApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.todo_id },
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoCommentCreate
		});

		return namedActionResult(result, 'createTodoComment');
	},
	editTodoComment: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, editTodoCommentSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await updateTodoItemComments({
					client: createApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.todo_id, comment_id: validation.data.id },
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoCommentUpdate
		});

		return namedActionResult(result, 'editTodoComment');
	},
	addTag: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, addTagSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await attachToTodoTags({
					client: createApiClient({ token: locals.token, fetch }),
					path: { tag_name: validation.data.name },
					body: { ...validation.data, create_if_doesnt_exist: true },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TagAttachToTodo
		});

		return namedActionResult(result, 'addTag');
	},
	editTag: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, editTagSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await updateTags({
					client: createApiClient({ token: locals.token, fetch }),
					path: { tag_name: validation.data.name },
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TagUpdate
		});

		return namedActionResult(result, 'editTag');
	},
	addTodoItemDependency: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, addTodoItemDependencySchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await addTodoItemDependencyTodoItems({
					client: createApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.todo_id },
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: TodoItemAddDependency
		});

		return namedActionResult(result, 'addTodoItemDependency');
	}
} satisfies Actions;
