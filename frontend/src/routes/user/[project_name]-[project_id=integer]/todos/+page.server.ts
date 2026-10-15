import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
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
	editTodoItemSchema,
	RESET_DUE_DATE
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
import { callService } from '$lib/client-wrapper/wrapper.universal';
import { convertNumberToHttpStatusCode } from '$lib/utils';
import { createServerApiClient } from '$lib/client-wrapper/clients.server';
import {
	addTodoItemDependencyTodoItems,
	attachToProjectTodoCategories,
	attachToTodoTags,
	createForUserTodoCategories,
	createForUserTodoItems,
	createTodoItemComments,
	searchTodoCategories,
	updateTags,
	updateTodoCategories,
	updateTodoItemComments,
	updateTodoItems
} from '$lib/generated-client';

export const load = (async ({ locals, fetch, params }) => {
	return await callService({
		call: async () => {
			return await searchTodoCategories({
				client: createServerApiClient({ token: locals.token, fetch }),
				query: { project_id: Number.parseInt(params.project_id) }
			});
		},
		errorHandler: async (e) => {
			if (e.status == 401) {
				return; // allow default unauthenticated user handling
			}
			error(convertNumberToHttpStatusCode(e.status), {
				message: 'An error occurred while fetching your todos!'
			});
		}
	});
}) satisfies PageServerLoad;

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
				return await createForUserTodoItems({
					client: createServerApiClient({ token: locals.token, fetch }),
					body: validation.data
				});
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
				return await createForUserTodoCategories({
					client: createServerApiClient({ token: locals.token, fetch }),
					body: validation.data
				});
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
				return await attachToProjectTodoCategories({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { category_id: validation.data.category_id },
					body: validation.data
				});
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
				return await updateTodoCategories({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { category_id: validation.data.id },
					body: { item: validation.data }
				});
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

		validation.data.due_date ??= RESET_DUE_DATE;

		const result = await callServiceInFormActions({
			call: async () => {
				return await updateTodoItems({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.id },
					body: { item: validation.data }
				});
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
				return await createTodoItemComments({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.todo_id },
					body: validation.data
				});
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
				return await updateTodoItemComments({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.todo_id, comment_id: validation.data.id },
					body: validation.data
				});
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
				return await attachToTodoTags({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { tag_name: validation.data.name },
					body: { ...validation.data, create_if_doesnt_exist: true }
				});
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
				return await updateTags({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { tag_name: validation.data.name },
					body: validation.data
				});
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
				return await addTodoItemDependencyTodoItems({
					client: createServerApiClient({ token: locals.token, fetch }),
					path: { todo_id: validation.data.todo_id },
					body: validation.data
				});
			},
			errorSchema: TodoItemAddDependency
		});

		return namedActionResult(result, 'addTodoItemDependency');
	}
} satisfies Actions;
