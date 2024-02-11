import { namedActionResult, validateFormActionRequest } from '$lib';
import { TagClient } from '$lib/client-wrapper/clients';
import type { Actions } from './$types';
import { searchTagSchema } from './validator';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';

export const actions = {
	search: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, searchTagSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			serviceCall: async () => {
				if (validation.data.projectId) {
					return await TagClient({
						token: locals.token,
						fetchApi: fetch
					}).searchTag(validation.data.name, validation.data.projectId);
				} else {
					return await TagClient({
						token: locals.token,
						fetchApi: fetch
					}).searchTag(validation.data.name);
				}
			},
			errorSchema: searchTagSchema
		});

		return namedActionResult(result, 'search');
	}
} satisfies Actions;
