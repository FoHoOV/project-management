import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { convertFormDataToObject, namedActionResult, superFail } from '$lib/actions/form';
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
	TagCreate,
	TagAttachToTodo,
	TagUpdate,
	TodoItemAddDependency
} from '$lib/generated-client/zod/schemas';
import {
	ErrorType,
	callService,
	callServiceInFormActions,
	superApplyAction
} from '$lib/client-wrapper';
import {
	TodoItemClient,
	TodoCategoryClient,
	TodoItemCommentClient,
	TagClient
} from '$lib/client-wrapper/clients';
import { ErrorCode } from '$lib/generated-client/models';

export const load = (async ({ locals, fetch, params }) => {
	// https://github.com/sveltejs/kit/issues/9785
	// if we reject or throw a redirect in streamed promises it doesn't work for now and crashes the server
	// we have to wait for a fix or handle the error and make it an expected error :(
	// even returning an error (which is an expected error) still results in a server crash :(
	// return {
	// 	streamed: {
	// 		todos: callService({
	// 			serviceCall: async () => {
	// 				return await TodoCategoryClient({
	// 					token: locals.token,
	// 					fetchApi: fetch
	// 				}).getForUserTodoCategory(Number.parseInt(params.project_id));
	// 			},
	// 			errorCallback: async (e) => {
	// 				if (e.type === ErrorType.UNAUTHORIZED) {
	// 					e.preventDefaultHandler = true;
	// 				}
	// 				return error(e.status >= 400 ? e.status : 400, { message: 'Error fetching your todos!' });
	// 			}
	// 		})
	// 	}

	return await callService({
		serviceCall: async () => {
			return await TodoCategoryClient({
				token: locals.token,
				fetchApi: fetch
			}).getForUserTodoCategory(Number.parseInt(params.project_id));
		},
		errorCallback: async (e) => {
			throw error(e.status >= 400 ? e.status : 400, { message: 'Error fetching your todos!' });
		}
	});
}) satisfies PageServerLoad;

export const actions: Actions = {
	addTodo: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const validationsResult = await createTodoItemSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}

		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoItemClient({
					token: locals.token,
					fetchApi: fetch
				}).createForUserTodoItem({
					...validationsResult.data
				});
			},
			errorSchema: TodoItemCreate
		});

		return namedActionResult(result, 'addTodo');
	},
	createCategory: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await createTodoCategorySchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoCategoryClient({
					token: locals.token,
					fetchApi: fetch
				}).createForUserTodoCategory({
					...validationsResult.data
				});
			},
			errorSchema: TodoCategoryCreate
		});

		return namedActionResult(result, 'createCategory');
	},
	attachToProject: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await attachToProjectSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoCategoryClient({
					token: locals.token,
					fetchApi: fetch
				}).attachToProjectTodoCategory({
					...validationsResult.data
				});
			},
			errorSchema: TodoCategoryAttachAssociation
		});

		return namedActionResult(result, 'attachToProject');
	},
	editTodoCategory: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await editTodoCategorySchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoCategoryClient({
					token: locals.token,
					fetchApi: fetch
				}).updateItemTodoCategory({
					...validationsResult.data
				});
			},
			errorSchema: TodoCategoryUpdateItem
		});

		return namedActionResult(result, 'editTodoCategory');
	},
	editTodoItem: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await editTodoItemSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoItemClient({
					token: locals.token,
					fetchApi: fetch
				}).updateItemTodoItem({
					...validationsResult.data
				});
			},
			errorSchema: TodoItemUpdateItem
		});

		return namedActionResult(result, 'editTodoItem');
	},
	createTodoComment: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await createTodoCommentSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoItemCommentClient({
					token: locals.token,
					fetchApi: fetch
				}).createTodoItemComment({
					...validationsResult.data
				});
			},
			errorSchema: TodoCommentCreate
		});

		return namedActionResult(result, 'createTodoComment');
	},
	editTodoComment: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await editTodoCommentSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoItemCommentClient({
					token: locals.token,
					fetchApi: fetch
				}).updateTodoItemComment({
					...validationsResult.data
				});
			},
			errorSchema: TodoCommentUpdate
		});

		return namedActionResult(result, 'editTodoComment');
	},
	addTag: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await addTagSchema.safeParseAsync(convertFormDataToObject(formData));

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TagClient({
					token: locals.token,
					fetchApi: fetch
				}).attachToTodoTag({ ...validationsResult.data, create_if_doesnt_exist: true });
			},
			errorSchema: TagAttachToTodo
		});

		return namedActionResult(result, 'addTag');
	},
	editTag: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await editTagSchema.safeParseAsync(convertFormDataToObject(formData));

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TagClient({
					token: locals.token,
					fetchApi: fetch
				}).updateTag({
					...validationsResult.data
				});
			},
			errorSchema: TagUpdate
		});

		return namedActionResult(result, 'editTag');
	},
	addTodoItemDependency: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await addTodoItemDependencySchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoItemClient({
					token: locals.token,
					fetchApi: fetch
				}).addTodoItemDependencyTodoItem({
					...validationsResult.data
				});
			},
			errorSchema: TodoItemAddDependency
		});

		return namedActionResult(result, 'addTodoItemDependency');
	}
} satisfies Actions;
