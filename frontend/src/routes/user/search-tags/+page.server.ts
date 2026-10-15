import { namedActionResult, validateFormActionRequest } from '$lib';
import { createServerApiClient } from '$lib/client-wrapper/clients.server';
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
				return await searchTags({
					client: createServerApiClient({ token: locals.token, fetch }),
					query: validation.data
				});
			},
			errorSchema: searchTagSchema
		});

		return namedActionResult(result, 'search');
	}
} satisfies Actions;
