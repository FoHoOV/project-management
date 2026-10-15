import { namedActionResult, validateFormActionRequest } from '$lib';
import { createApiClient } from '$lib/client-wrapper/clients';
import { searchTags } from '$lib/generated-client';
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
			call: async () => {
				const { data } = await searchTags({
					client: createApiClient({ token: locals.token, fetch }),
					query: validation.data,
					throwOnError: true
				});
				return data;
			},
			errorSchema: searchTagSchema
		});

		return namedActionResult(result, 'search');
	}
} satisfies Actions;
