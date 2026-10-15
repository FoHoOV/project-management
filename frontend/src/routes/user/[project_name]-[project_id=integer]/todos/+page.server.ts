import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateFormActionRequest, namedActionResult } from '#lib/actions/form/index.js';
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
} from '#lib/generated-client/zod.gen.js';
import { callServiceInFormActions } from '#lib/client-wrapper/wrapper.server.js';
import { callService } from '#lib/client-wrapper/wrapper.universal.js';
import { convertNumberToHttpStatusCode } from '#lib/utils/index.js';
import { createApiClient } from '#api-client';
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
} from '#lib/generated-client/index.js';

export const load = (async ({ params }) => {
	return await callService({
		call: async () => {
			return await searchTodoCategories({
				client: createApiClient(),
				query: { project_id: Number.parseInt(params.project_id) }
			});
		},
		errorHandler: async (e) => {
			if (e.status == 401) {
				return; // allow default unauthenticated user handling
			}
			error(
				convertNumberToHttpStatusCode(e.status),
				'An error occurred while fetching your todos!'
			);
		}
	});
}) satisfies PageServerLoad;

// TODO: probably should separate these to their own routes (todo/[edit|create] or category/[edit]/create, ...)
// with the new shallow routing I can separate the associated components as well (but i'll w8 for the svelte5 for the big refactor)
export const actions: Actions = {
	addTodo: async ({ request }) => {
		const validation = await validateFormActionRequest(request, createTodoItemSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await createForUserTodoItems({
					client: createApiClient(),
					body: validation.data
				});
			},
			errorSchema: TodoItemCreate
		});

		return namedActionResult(result, 'addTodo');
	},
	createCategory: async ({ request }) => {
		const validation = await validateFormActionRequest(request, createTodoCategorySchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await createForUserTodoCategories({
					client: createApiClient(),
					body: validation.data
				});
			},
			errorSchema: TodoCategoryCreate
		});

		return namedActionResult(result, 'createCategory');
	},
	attachToProject: async ({ request }) => {
		const validation = await validateFormActionRequest(request, attachToProjectSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await attachToProjectTodoCategories({
					client: createApiClient(),
					path: { category_id: validation.data.category_id },
					body: validation.data
				});
			},
			errorSchema: TodoCategoryAttachAssociation
		});

		return namedActionResult(result, 'attachToProject');
	},
	editTodoCategory: async ({ request }) => {
		const validation = await validateFormActionRequest(request, editTodoCategorySchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await updateTodoCategories({
					client: createApiClient(),
					path: { category_id: validation.data.id },
					body: { item: validation.data }
				});
			},
			errorSchema: TodoCategoryUpdateItem
		});

		return namedActionResult(result, 'editTodoCategory');
	},
	editTodoItem: async ({ request }) => {
		const validation = await validateFormActionRequest(request, editTodoItemSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await updateTodoItems({
					client: createApiClient(),
					path: { todo_id: validation.data.id },
					body: { item: validation.data }
				});
			},
			errorSchema: TodoItemUpdateItem
		});

		return namedActionResult(result, 'editTodoItem');
	},
	createTodoComment: async ({ request }) => {
		const validation = await validateFormActionRequest(request, createTodoCommentSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await createTodoItemComments({
					client: createApiClient(),
					path: { todo_id: validation.data.todo_id },
					body: validation.data
				});
			},
			errorSchema: TodoCommentCreate
		});

		return namedActionResult(result, 'createTodoComment');
	},
	editTodoComment: async ({ request }) => {
		const validation = await validateFormActionRequest(request, editTodoCommentSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await updateTodoItemComments({
					client: createApiClient(),
					path: { todo_id: validation.data.todo_id, comment_id: validation.data.id },
					body: validation.data
				});
			},
			errorSchema: TodoCommentUpdate
		});

		return namedActionResult(result, 'editTodoComment');
	},
	addTag: async ({ request }) => {
		const validation = await validateFormActionRequest(request, addTagSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await attachToTodoTags({
					client: createApiClient(),
					path: { tag_name: validation.data.name },
					body: { ...validation.data, create_if_doesnt_exist: true }
				});
			},
			errorSchema: TagAttachToTodo
		});

		return namedActionResult(result, 'addTag');
	},
	editTag: async ({ request }) => {
		const validation = await validateFormActionRequest(request, editTagSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await updateTags({
					client: createApiClient(),
					path: { tag_name: validation.data.name },
					body: validation.data
				});
			},
			errorSchema: TagUpdate
		});

		return namedActionResult(result, 'editTag');
	},
	addTodoItemDependency: async ({ request }) => {
		const validation = await validateFormActionRequest(request, addTodoItemDependencySchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await addTodoItemDependencyTodoItems({
					client: createApiClient(),
					path: { todo_id: validation.data.todo_id },
					body: validation.data
				});
			},
			errorSchema: TodoItemAddDependency
		});

		return namedActionResult(result, 'addTodoItemDependency');
	}
} satisfies Actions;
