import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { convertFormDataToObject, superFail } from '$lib/enhance/form';
import { schema } from './validator';
import { TodoCreate } from '$lib/client/zod/schemas';
import { ErrorType, callService, callServiceInFormActions } from '$lib/client-wrapper';
import { TodoClient } from '$lib/client-wrapper/clients';

export const load = (async ({ locals, fetch }) => {
	// https://github.com/sveltejs/kit/issues/9785
	// if we reject or throw a redirect in streamed promises it doesn't work for now
	// we have to wait for a fix or handle the error and make it an expected error :(
	return {
		streamed: {
			todos: callService({
				serviceCall: async () =>
					await TodoClient({ token: locals.token, fetchApi: fetch }).getForUser('all'),
				errorCallback: async (e) => {
					if (e.type === ErrorType.UNAUTHORIZED) {
						e.preventDefaultHandler = true;
					}
					return error(e.status, { message: 'Error fetching your todos!' });
				}
			})
		}
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await schema.safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}

		return await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoClient({ token: locals.token, fetchApi: fetch }).createForUser({
					...validationsResult.data
				});
			},
			errorSchema: TodoCreate
		});
	}
} satisfies Actions;
