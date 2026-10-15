import { namedActionResult, validateFormActionRequest } from '$lib';
import { createApiClient } from '$lib/client-wrapper/clients';
import { searchTags } from '$lib/generated-client';
import type { Actions } from './$types';
import { searchTagSchema } from './validator';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';

export const actions = {
	search: async ({ request, fetch }) => {
		const validation = await validateFormActionRequest(request, searchTagSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await searchTags({
					client: createApiClient(fetch),
					query: validation.data
				});
			},
			errorSchema: searchTagSchema
		});

		return namedActionResult(result, 'search');
	}
} satisfies Actions;
