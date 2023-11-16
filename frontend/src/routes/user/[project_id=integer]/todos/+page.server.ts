import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { convertFormDataToObject, superFail } from '$lib/enhance/form';
import { createTodoCategorySchema, createTodoItemSchema } from './validator';
import { TodoItemCreate, TodoCategoryCreate } from '$lib/client/zod/schemas';
import { ErrorType, callService, callServiceInFormActions } from '$lib/client-wrapper';
import { TodoItemClient, TodoCategoryClient } from '$lib/client-wrapper/clients';

export const load = (async ({ locals, fetch, params }) => {
	// https://github.com/sveltejs/kit/issues/9785
	// if we reject or throw a redirect in streamed promises it doesn't work for now and crashes the server
	// we have to wait for a fix or handle the error and make it an expected error :(
	// even returning an error (which is an expected error) still results in a server crash :(
	return {
		streamed: {
			todos: callService({
				serviceCall: async () => {
					return await TodoCategoryClient({
						token: locals.token,
						fetchApi: fetch
					}).getForUserTodoCategory(Number.parseInt(params.project_id));
				},
				errorCallback: async (e) => {
					if (e.type === ErrorType.UNAUTHORIZED) {
						e.preventDefaultHandler = true;
					}
					return error(e.status >= 400 ? e.status : 400, { message: 'Error fetching your todos!' });
				}
			})
		}
	};
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

		return {
			addTodo: await callServiceInFormActions({
				serviceCall: async () => {
					return await TodoItemClient({
						token: locals.token,
						fetchApi: fetch
					}).createForUserTodoItem({
						...validationsResult.data
					});
				},
				errorSchema: TodoItemCreate
			})
		};
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

		return {
			createCategory: await callServiceInFormActions({
				serviceCall: async () => {
					return await TodoCategoryClient({
						token: locals.token,
						fetchApi: fetch
					}).createForUserTodoCategory({
						...validationsResult.data
					});
				},
				errorSchema: TodoCategoryCreate
			})
		};
	}
} satisfies Actions;
