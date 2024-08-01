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
} from '$lib/generated-client/zod/schemas';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';
import {
	TodoItemClient,
	TodoCategoryClient,
	TodoItemCommentClient,
	TagClient
} from '$lib/client-wrapper/clients';

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
				return await TodoItemClient({
					token: locals.token,
					fetchApi: fetch
				}).createForUserTodoItems({
					...validation.data
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
				return await TodoCategoryClient({
					token: locals.token,
					fetchApi: fetch
				}).createForUserTodoCategories({
					...validation.data
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
				return await TodoCategoryClient({
					token: locals.token,
					fetchApi: fetch
				}).attachToProjectTodoCategories(validation.data.category_id, {
					...validation.data
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
				return await TodoCategoryClient({
					token: locals.token,
					fetchApi: fetch
				}).updateTodoCategories(validation.data.id, {
					item: validation.data
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

		if (!validation.data.due_date) {
			const date = new Date(0);
			date.setFullYear(1, 0, 1);
			validation.data.due_date = date;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await TodoItemClient({
					token: locals.token,
					fetchApi: fetch
				}).updateTodoItems(validation.data.id, { item: validation.data });
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
				return await TodoItemCommentClient({
					token: locals.token,
					fetchApi: fetch
				}).createTodoItemComments(validation.data.todo_id, {
					...validation.data
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
				return await TodoItemCommentClient({
					token: locals.token,
					fetchApi: fetch
				}).updateTodoItemComments(validation.data.todo_id, validation.data.id, {
					...validation.data
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
				return await TagClient({
					token: locals.token,
					fetchApi: fetch
				}).attachToTodoTags(validation.data.name, {
					...validation.data,
					create_if_doesnt_exist: true
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
				return await TagClient({
					token: locals.token,
					fetchApi: fetch
				}).updateTags(validation.data.name, {
					...validation.data
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
				return await TodoItemClient({
					token: locals.token,
					fetchApi: fetch
				}).addTodoItemDependencyTodoItems(validation.data.todo_id, {
					...validation.data
				});
			},
			errorSchema: TodoItemAddDependency
		});

		return namedActionResult(result, 'addTodoItemDependency');
	}
} satisfies Actions;
